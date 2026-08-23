import { parseJsonObject } from "./jsonExtract.js";
import {
  buildEvaluateUserPrompt,
  buildGenerateUserPrompt,
} from "./prompts.js";
import { normalizeErrors, normalizeScore } from "./score.js";

export const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";
export const GEMINI_TIMEOUT_MS = 60_000;
export const GM_KEY_STORAGE = "geminiApiKey";
export const GM_MODEL_STORAGE = "geminiModel";

/**
 * @typedef {{
 *   GM_xmlhttpRequest: (details: object) => void,
 *   GM_getValue: (key: string, defaultValue?: string) => string,
 *   GM_setValue: (key: string, value: string) => void,
 * }} GmApi
 */

/**
 * @param {GmApi} gm
 * @returns {string}
 */
export function getApiKey(gm) {
  const key = (gm.GM_getValue(GM_KEY_STORAGE, "") || "").trim();
  if (!key) {
    throw new Error(
      "Gemini API key not set. Open Tampermonkey script settings / values and set geminiApiKey.",
    );
  }
  return key;
}

/**
 * @param {GmApi} gm
 * @returns {string}
 */
export function getModelName(gm) {
  const model = (gm.GM_getValue(GM_MODEL_STORAGE, "") || "").trim();
  return model || DEFAULT_GEMINI_MODEL;
}

/**
 * @param {GmApi} gm
 * @param {string} key
 */
export function setApiKey(gm, key) {
  gm.GM_setValue(GM_KEY_STORAGE, String(key ?? "").trim());
}

/**
 * Privileged HTTP via GM_xmlhttpRequest (bypasses CORS).
 * @param {GmApi} gm
 * @param {{ method?: string, url: string, headers?: Record<string,string>, data?: string, timeoutMs?: number }} opts
 * @returns {Promise<{ status: number, responseText: string }>}
 */
export function gmRequest(gm, opts) {
  const timeoutMs = opts.timeoutMs ?? GEMINI_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Gemini timeout"));
    }, timeoutMs);

    gm.GM_xmlhttpRequest({
      method: opts.method ?? "POST",
      url: opts.url,
      headers: opts.headers ?? {},
      data: opts.data,
      onload: (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          status: res.status,
          responseText: res.responseText ?? "",
        });
      },
      onerror: () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error("Gemini network error"));
      },
      ontimeout: () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error("Gemini timeout"));
      },
    });
  });
}

/**
 * @param {GmApi} gm
 * @param {string} promptText
 * @returns {Promise<unknown>}
 */
export async function generateContentJson(gm, promptText) {
  const key = getApiKey(gm);
  const model = getModelName(gm);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { responseMimeType: "application/json" },
  };
  const res = await gmRequest(gm, {
    url,
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(body),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `Gemini HTTP ${res.status}: ${res.responseText.slice(0, 300)}`,
    );
  }
  let envelope;
  try {
    envelope = JSON.parse(res.responseText);
  } catch {
    throw new Error(
      `Gemini response not JSON: ${res.responseText.slice(0, 300)}`,
    );
  }
  const text =
    envelope?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("") ?? "";
  if (!text) {
    throw new Error(
      `Gemini empty candidates: ${res.responseText.slice(0, 300)}`,
    );
  }
  return parseJsonObject(text);
}

/**
 * @param {GmApi} gm
 * @param {"Email"|"Academic"} type
 * @returns {Promise<{ title: string, content: string }>}
 */
export async function generateQuestion(gm, type) {
  const parsed = await generateContentJson(gm, buildGenerateUserPrompt(type));
  const title = String(/** @type {{title?: unknown}} */ (parsed).title ?? "");
  const content = String(
    /** @type {{content?: unknown}} */ (parsed).content ?? "",
  );
  if (!title || !content) {
    throw new Error("Generate response missing title/content");
  }
  return { title, content };
}

/**
 * @param {GmApi} gm
 * @param {"Email"|"Academic"} taskType
 * @param {string} prompt
 * @param {string} essay
 * @returns {Promise<{ score: number, feedback: string, errors: object[] }>}
 */
export async function evaluateEssay(gm, taskType, prompt, essay) {
  const parsed = await generateContentJson(
    gm,
    buildEvaluateUserPrompt(taskType, prompt, essay),
  );
  const obj = /** @type {{ score?: unknown, feedback?: unknown, errors?: unknown }} */ (
    parsed
  );
  return {
    score: normalizeScore(obj.score),
    feedback: String(obj.feedback ?? ""),
    errors: normalizeErrors(obj.errors),
  };
}
