import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateEssay,
  generateQuestion,
  getApiKey,
  GM_KEY_STORAGE,
} from "./geminiClient.js";

function mockGm({ key = "test-key", responses = [] } = {}) {
  const store = { [GM_KEY_STORAGE]: key };
  let i = 0;
  return {
    GM_getValue: (k, d = "") => store[k] ?? d,
    GM_setValue: (k, v) => {
      store[k] = v;
    },
    GM_xmlhttpRequest: (details) => {
      const next = responses[i++] ?? {
        status: 500,
        responseText: "no mock",
      };
      queueMicrotask(() => {
        if (typeof next === "function") {
          next(details);
          return;
        }
        details.onload?.({
          status: next.status,
          responseText: next.responseText,
        });
      });
    },
  };
}

function geminiEnvelope(innerJson) {
  return JSON.stringify({
    candidates: [{ content: { parts: [{ text: innerJson }] } }],
  });
}

describe("geminiClient", () => {
  it("rejects missing API key before network", () => {
    const gm = mockGm({ key: "" });
    assert.throws(() => getApiKey(gm), /API key not set/);
  });

  it("generateQuestion parses title/content", async () => {
    const gm = mockGm({
      responses: [
        {
          status: 200,
          responseText: geminiEnvelope(
            '{"title":"T","content":"Write an email"}',
          ),
        },
      ],
    });
    const q = await generateQuestion(gm, "Email");
    assert.equal(q.title, "T");
    assert.equal(q.content, "Write an email");
  });

  it("evaluateEssay normalizes score", async () => {
    const gm = mockGm({
      responses: [
        {
          status: 200,
          responseText: geminiEnvelope(
            '{"score":3.2,"feedback":"ok","errors":[{"type":"grammar","incorrect":"a","suggestion":"b","explanation":"c"}]}',
          ),
        },
      ],
    });
    const ev = await evaluateEssay(gm, "Email", "prompt", "essay");
    assert.equal(ev.score, 3);
    assert.equal(ev.feedback, "ok");
    assert.equal(ev.errors[0].type, "Grammar and Spelling");
  });

  it("throws on HTTP error", async () => {
    const gm = mockGm({
      responses: [{ status: 403, responseText: "forbidden" }],
    });
    await assert.rejects(
      () => generateQuestion(gm, "Academic"),
      /Gemini HTTP 403/,
    );
  });
});
