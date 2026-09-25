import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import { dictionaries } from "@/lib/i18n/messages";
import NotificationsSettingsPage from "./page";

setupDomGlobals();
// tsx compiles the page's JSX with the classic runtime, which expects a global React.
Object.assign(globalThis, { React });

/**
 * Regression test for issue #770: each notification toggle on the settings
 * page must expose its visible title as the switch's accessible name, so a
 * future edit can't silently drop PreferenceToggle's `label` prop again.
 */
test("notifications settings page — every toggle's accessible name matches its title", async () => {
  const channels = dictionaries.en.settings.notifications.channels;
  const expectedTitles = [
    channels.emailTitle,
    channels.transactionTitle,
    channels.weeklyTitle,
    channels.productTitle,
    channels.securityTitle,
  ];

  const { findAllByRole, getByRole } = render(
    createElement(
      I18nProvider,
      null,
      createElement(ToastProvider, null, createElement(NotificationsSettingsPage)),
    ),
  );

  const checkboxes = await findAllByRole("checkbox", {}, { timeout: 3000 });
  assert.equal(checkboxes.length, expectedTitles.length);

  for (const title of expectedTitles) {
    assert.ok(
      getByRole("checkbox", { name: title }),
      `expected a toggle with accessible name "${title}"`,
    );
  }

  cleanup();
});
