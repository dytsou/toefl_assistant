import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { softDecrement, timerSecondsForType } from "./timers.js";
import { countWords } from "./wordCount.js";
import { normalizeErrorType, normalizeScore } from "./score.js";
import { extractJsonObjectText, parseJsonObject } from "./jsonExtract.js";
import {
  formatPromptBlock,
  formatScoreBlock,
  SESSION_HEADER,
} from "./sessionBlock.js";

describe("timers", () => {
  it("uses Practice.tsx durations", () => {
    assert.equal(timerSecondsForType("Email"), 420);
    assert.equal(timerSecondsForType("Academic"), 600);
  });

  it("softDecrement stops at zero", () => {
    assert.equal(softDecrement(1), 0);
    assert.equal(softDecrement(0), 0);
    assert.equal(softDecrement(5), 4);
  });
});

describe("countWords", () => {
  it("matches trim + split", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("  "), 0);
    assert.equal(countWords("one two three"), 3);
    assert.equal(countWords("  hello   world  "), 2);
  });
});

describe("normalizeScore", () => {
  it("clamps to 0–5 half-steps", () => {
    assert.equal(normalizeScore(3.2), 3);
    assert.equal(normalizeScore(3.3), 3.5);
    assert.equal(normalizeScore(9), 5);
    assert.equal(normalizeScore(-1), 0);
    assert.equal(normalizeScore("4.5"), 4.5);
  });
});

describe("normalizeErrorType", () => {
  it("maps aliases and falls back to Elaboration", () => {
    assert.equal(normalizeErrorType("grammar"), "Grammar and Spelling");
    assert.equal(normalizeErrorType("Elaboration"), "Elaboration");
    assert.equal(normalizeErrorType("weird"), "Elaboration");
  });
});

describe("extractJsonObjectText", () => {
  it("strips fences", () => {
    assert.equal(
      extractJsonObjectText('```json\n{"a":1}\n```'),
      '{"a":1}',
    );
  });

  it("throws without object", () => {
    assert.throws(() => extractJsonObjectText("nope"), /Failed to parse/);
  });

  it("parseJsonObject returns object", () => {
    assert.deepEqual(parseJsonObject('{"title":"t","content":"c"}'), {
      title: "t",
      content: "c",
    });
  });
});

describe("sessionBlock", () => {
  it("formats prompt block", () => {
    const text = formatPromptBlock({
      type: "Email",
      title: "Office hours",
      content: "Please write…",
      timestamp: "2026-08-05T00:00:00.000Z",
    });
    assert.match(text, new RegExp(SESSION_HEADER));
    assert.match(text, /Type: Email/);
    assert.match(text, /## Prompt/);
    assert.match(text, /Please write/);
  });

  it("formats grading-failed block with essay", () => {
    const text = formatScoreBlock({
      essay: "My essay body",
      gradingFailed: true,
      gradingFailedReason: "timeout",
    });
    assert.match(text, /## Essay/);
    assert.match(text, /My essay body/);
    assert.match(text, /## GRADING FAILED/);
    assert.match(text, /timeout/);
  });

  it("formats successful score block", () => {
    const text = formatScoreBlock({
      essay: "Body",
      score: 4,
      feedback: "Good",
      errors: [
        {
          type: "Elaboration",
          incorrect: "x",
          suggestion: "y",
          explanation: "z",
        },
      ],
    });
    assert.match(text, /## Score\n4/);
    assert.match(text, /## Feedback\nGood/);
    assert.match(text, /\[Elaboration\]/);
  });
});
