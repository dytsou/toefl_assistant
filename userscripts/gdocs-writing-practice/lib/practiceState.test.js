import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialState, reduce } from "./practiceState.js";

describe("practiceState", () => {
  it("starts Email at 420", () => {
    assert.equal(initialState().timerRemaining, 420);
  });

  it("keeps editor open at timer zero", () => {
    let s = reduce(initialState(), {
      type: "GENERATE_OK",
      payload: { title: "t", content: "c" },
    });
    assert.equal(s.phase, "practicing");
    for (let i = 0; i < 500; i++) s = reduce(s, { type: "TICK" });
    assert.equal(s.timerRemaining, 0);
    assert.equal(s.phase, "practicing");
    s = reduce(s, { type: "SET_ESSAY", payload: "still writing" });
    assert.equal(s.essay, "still writing");
  });

  it("SCORE_FAIL_KEPT returns to idle with message", () => {
    let s = reduce(initialState(), {
      type: "GENERATE_OK",
      payload: { title: "t", content: "c" },
    });
    s = reduce(s, { type: "SCORE_START" });
    s = reduce(s, { type: "SCORE_FAIL_KEPT", payload: "timeout" });
    assert.equal(s.phase, "idle");
    assert.match(s.status, /timeout/);
  });
});
