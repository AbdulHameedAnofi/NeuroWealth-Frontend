import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./CommandPaletteDialog.tsx", import.meta.url), "utf8");

test("allCommands is wrapped in useMemo with stable dependencies", () => {
  assert.match(source, /const allCommands: Command\[\] = useMemo\(/);
  assert.match(source, /\[router, onClose\]/);
});

test("filteredCommands is wrapped in useMemo and depends on allCommands + query", () => {
  assert.match(source, /const filteredCommands = useMemo\(/);
  assert.match(source, /\[allCommands, query\]/);
});

test("mockActions are hoisted out of the render body", () => {
  assert.match(source, /const mockActions = \[/);
  // The mock action list must not be recreated inside the component render.
  const componentBody = source.slice(source.indexOf("export function CommandPaletteDialog"));
  assert.doesNotMatch(componentBody, /const mockActions = \[/);
});
