/**
 * Concatenate ESM libs into a single Tampermonkey userscript (no bundler).
 * Strips import/export and wraps in IIFE with GM globals.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, "lib");

const ORDER = [
  "timers.js",
  "wordCount.js",
  "score.js",
  "jsonExtract.js",
  "sessionBlock.js",
  "prompts.js",
  "geminiClient.js",
  "docsAppend.js",
  "practiceState.js",
  "sidebar.js",
];

function stripModuleSyntax(source, filename) {
  let s = source;
  s = s.replace(/^import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "");
  s = s.replace(/^export\s+async\s+function\s+/gm, "async function ");
  s = s.replace(/^export\s+function\s+/gm, "function ");
  s = s.replace(/^export\s+const\s+/gm, "const ");
  s = s.replace(/^export\s+\{[^}]+\};?\s*$/gm, "");
  if (/^export\s+/m.test(s)) {
    throw new Error(`Unhandled export in ${filename}`);
  }
  return s;
}

const parts = ORDER.map((name) => {
  const raw = fs.readFileSync(path.join(libDir, name), "utf8");
  return `/* ---- ${name} ---- */\n${stripModuleSyntax(raw, name)}`;
});

const header = `// ==UserScript==
// @name         TOEFL Writing Practice (Google Docs)
// @namespace    https://github.com/dytsou/toefl_writing_assistant
// @version      1.0.1
// @description  Generate TOEFL Writing prompts, practice in a sidebar, score with Gemini, append to the Doc
// @author       dytsou
// @match        https://docs.google.com/document/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      generativelanguage.googleapis.com
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/dytsou/toefl_assistant/dev/userscripts/gdocs-writing-practice/toefl-writing-practice.user.js
// @downloadURL  https://raw.githubusercontent.com/dytsou/toefl_assistant/dev/userscripts/gdocs-writing-practice/toefl-writing-practice.user.js
// ==/UserScript==
`;

const body = `(function () {
  "use strict";
${parts.join("\n")}

  const gm = {
    GM_xmlhttpRequest,
    GM_getValue,
    GM_setValue,
  };

  function boot() {
    try {
      mountSidebar(gm);
    } catch (e) {
      console.error("[TOEFL TM]", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
`;

const outPath = path.join(__dirname, "toefl-writing-practice.user.js");
fs.writeFileSync(outPath, header + body);
console.log("Wrote", outPath);
