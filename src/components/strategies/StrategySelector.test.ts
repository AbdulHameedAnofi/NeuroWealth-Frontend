import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { StrategySelector } from "./StrategySelector";

setupDomGlobals();

function createJsonResponse<T>(payload: T): Response {
  return new Response(JSON.stringify({ success: true, data: payload }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("StrategySelector load and retry flow", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setupDomGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("shows the load-error banner and retries the fetch", async () => {
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new TypeError("network down");
      }
      return createJsonResponse({ strategy: "balanced" });
    }) as typeof fetch;

    render(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(StrategySelector),
      ),
    );

    await waitFor(() => {
      assert.ok(screen.getByRole("alert"));
    });

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      assert.equal(callCount, 2);
    });

    await waitFor(() => {
      assert.ok(screen.getByText(/balanced/i));
    });
  });

  it("ignores a stale in-flight response from an earlier retry", async () => {
    const deferred: Array<Promise<Response>> = [];
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new TypeError("network down");
      }

      const promise = new Promise<Response>((resolve) => {
        if (callCount === 2) {
          setTimeout(() => resolve(createJsonResponse({ strategy: "conservative" })), 25);
          return;
        }
        setTimeout(() => resolve(createJsonResponse({ strategy: "balanced" })), 0);
      });
      deferred.push(promise);
      return promise;
    }) as typeof fetch;

    render(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(StrategySelector),
      ),
    );

    await waitFor(() => {
      assert.ok(screen.getByRole("alert"));
    });

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      assert.equal(callCount, 3);
    });

    await act(async () => {
      await Promise.all(deferred);
    });

    await waitFor(() => {
      assert.ok(screen.getByText(/balanced/i));
    });
  });
});
