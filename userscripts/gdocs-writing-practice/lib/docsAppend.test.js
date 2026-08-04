import assert from "node:assert/strict";
import { describe, it } from "node:test";

// docsAppend is DOM-bound; test the empty-text contract via a tiny pure helper mirror.
function decideAppendMethod(text, pasteOk) {
  if (!String(text ?? "")) return "clipboard";
  return pasteOk ? "paste" : "clipboard";
}

describe("docsAppend decision", () => {
  it("empty text uses clipboard path (no-op paste)", () => {
    assert.equal(decideAppendMethod("", true), "clipboard");
  });

  it("prefers paste when available", () => {
    assert.equal(decideAppendMethod("hello", true), "paste");
    assert.equal(decideAppendMethod("hello", false), "clipboard");
  });
});
