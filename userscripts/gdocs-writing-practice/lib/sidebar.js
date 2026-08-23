/**
 * Sidebar DOM + wiring for Google Docs page (loaded inside userscript IIFE).
 */
import { appendToFocusedDoc } from "./docsAppend.js";
import {
  evaluateEssay,
  generateQuestion,
  getApiKey,
  setApiKey,
} from "./geminiClient.js";
import { formatPromptBlock, formatScoreBlock } from "./sessionBlock.js";
import { countWords } from "./wordCount.js";
import { initialState, reduce } from "./practiceState.js";

/**
 * @param {import("./geminiClient.js").GmApi} gm
 */
export function mountSidebar(gm) {
  if (document.getElementById("toefl-tm-sidebar")) return;

  let state = initialState();
  /** @type {ReturnType<typeof setInterval> | null} */
  let tickTimer = null;

  const root = document.createElement("div");
  root.id = "toefl-tm-sidebar";
  root.innerHTML = `
    <style>
      #toefl-tm-sidebar {
        position: fixed; top: 72px; right: 12px; width: 340px; max-height: calc(100vh - 96px);
        z-index: 2147483646; background: #fff; border: 1px solid #dadce0; border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,.15); font: 13px/1.4 system-ui, sans-serif;
        display: flex; flex-direction: column; overflow: hidden;
      }
      #toefl-tm-sidebar header { padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #eee; background: #f8f9fa; }
      #toefl-tm-sidebar .body { padding: 10px 12px; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
      #toefl-tm-sidebar select, #toefl-tm-sidebar button, #toefl-tm-sidebar textarea, #toefl-tm-sidebar input {
        font: inherit; width: 100%; box-sizing: border-box;
      }
      #toefl-tm-sidebar textarea { min-height: 160px; resize: vertical; }
      #toefl-tm-sidebar .row { display: flex; gap: 6px; }
      #toefl-tm-sidebar .row > * { flex: 1; }
      #toefl-tm-sidebar .meta { color: #5f6368; font-size: 12px; }
      #toefl-tm-sidebar .prompt { white-space: pre-wrap; max-height: 140px; overflow: auto; background: #f1f3f4; padding: 8px; border-radius: 4px; }
      #toefl-tm-sidebar .status { color: #174ea6; min-height: 1.2em; }
      #toefl-tm-sidebar .hint { color: #b06000; white-space: pre-wrap; }
      #toefl-tm-sidebar button { cursor: pointer; padding: 6px 8px; border-radius: 4px; border: 1px solid #dadce0; background: #fff; }
      #toefl-tm-sidebar button.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
      #toefl-tm-sidebar button:disabled { opacity: .5; cursor: not-allowed; }
    </style>
    <header>TOEFL Writing Practice</header>
    <div class="body">
      <label>Type
        <select id="tm-type">
          <option value="Email">Email</option>
          <option value="Academic">Academic Discussion</option>
        </select>
      </label>
      <div class="row">
        <button type="button" class="primary" id="tm-generate">Generate</button>
        <button type="button" id="tm-score">Score</button>
      </div>
      <div class="meta" id="tm-meta">Timer — · Words 0</div>
      <div class="prompt" id="tm-prompt">(generate a prompt)</div>
      <textarea id="tm-essay" placeholder="Write your essay here…"></textarea>
      <div class="status" id="tm-status"></div>
      <div class="hint" id="tm-hint"></div>
      <details>
        <summary>API key</summary>
        <input id="tm-key" type="password" placeholder="Gemini API key" />
        <button type="button" id="tm-save-key">Save key</button>
      </details>
    </div>
  `;
  document.documentElement.appendChild(root);

  const elType = /** @type {HTMLSelectElement} */ (root.querySelector("#tm-type"));
  const elGen = /** @type {HTMLButtonElement} */ (root.querySelector("#tm-generate"));
  const elScore = /** @type {HTMLButtonElement} */ (root.querySelector("#tm-score"));
  const elMeta = /** @type {HTMLElement} */ (root.querySelector("#tm-meta"));
  const elPrompt = /** @type {HTMLElement} */ (root.querySelector("#tm-prompt"));
  const elEssay = /** @type {HTMLTextAreaElement} */ (root.querySelector("#tm-essay"));
  const elStatus = /** @type {HTMLElement} */ (root.querySelector("#tm-status"));
  const elHint = /** @type {HTMLElement} */ (root.querySelector("#tm-hint"));
  const elKey = /** @type {HTMLInputElement} */ (root.querySelector("#tm-key"));
  const elSaveKey = /** @type {HTMLButtonElement} */ (root.querySelector("#tm-save-key"));

  function render() {
    elType.value = state.type;
    elType.disabled = state.phase === "practicing" || state.phase === "scoring";
    elGen.disabled = state.phase === "generating" || state.phase === "scoring";
    elScore.disabled =
      state.phase !== "practicing" || !state.essay.trim() || state.phase === "scoring";
    elEssay.disabled = state.phase === "generating" || state.phase === "scoring";
    if (document.activeElement !== elEssay) {
      elEssay.value = state.essay;
    }
    const mm = String(Math.floor(state.timerRemaining / 60)).padStart(2, "0");
    const ss = String(state.timerRemaining % 60).padStart(2, "0");
    elMeta.textContent = `Timer ${mm}:${ss} · Words ${countWords(state.essay)}`;
    elPrompt.textContent = state.prompt
      ? `${state.title}\n\n${state.prompt}`
      : "(generate a prompt)";
    elStatus.textContent = state.status;
    elHint.textContent = state.pasteHint;
  }

  function dispatch(action) {
    state = reduce(state, action);
    render();
  }

  function ensureTick() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      if (state.phase === "practicing") dispatch({ type: "TICK" });
    }, 1000);
  }

  /**
   * @param {string} text
   */
  async function writeDoc(text) {
    const method = await appendToFocusedDoc(text);
    if (method === "clipboard") {
      dispatch({
        type: "SET_PASTE_HINT",
        payload:
          "Could not auto-insert into Docs. Text copied to clipboard — click in the Doc and paste (Cmd/Ctrl+V).",
      });
    } else {
      dispatch({ type: "SET_PASTE_HINT", payload: "" });
    }
  }

  elType.addEventListener("change", () => {
    dispatch({ type: "SET_TYPE", payload: elType.value });
  });
  elEssay.addEventListener("input", () => {
    dispatch({ type: "SET_ESSAY", payload: elEssay.value });
  });
  elSaveKey.addEventListener("click", () => {
    setApiKey(gm, elKey.value);
    elKey.value = "";
    dispatch({ type: "SET_STATUS", payload: "API key saved in Tampermonkey storage." });
  });

  elGen.addEventListener("click", async () => {
    try {
      getApiKey(gm);
    } catch (e) {
      dispatch({
        type: "SET_STATUS",
        payload: e instanceof Error ? e.message : String(e),
      });
      return;
    }
    dispatch({ type: "GENERATE_START" });
    try {
      const q = await generateQuestion(gm, state.type);
      dispatch({ type: "GENERATE_OK", payload: q });
      ensureTick();
      await writeDoc(
        formatPromptBlock({
          type: state.type,
          title: q.title,
          content: q.content,
        }),
      );
    } catch (e) {
      dispatch({
        type: "GENERATE_FAIL",
        payload: e instanceof Error ? e.message : String(e),
      });
    }
  });

  elScore.addEventListener("click", async () => {
    const essay = state.essay;
    const prompt = state.prompt;
    const type = state.type;
    dispatch({ type: "SCORE_START" });
    try {
      const ev = await evaluateEssay(gm, type, prompt, essay);
      await writeDoc(
        formatScoreBlock({
          essay,
          score: ev.score,
          feedback: ev.feedback,
          errors: ev.errors,
        }),
      );
      dispatch({
        type: "SCORE_DONE",
        payload: `Score ${ev.score}. Feedback written to Doc.`,
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      await writeDoc(
        formatScoreBlock({
          essay,
          gradingFailed: true,
          gradingFailedReason: reason,
        }),
      );
      dispatch({ type: "SCORE_FAIL_KEPT", payload: reason });
    }
  });

  try {
    const existing = gm.GM_getValue("geminiApiKey", "");
    if (existing) elKey.placeholder = "Key saved (enter to replace)";
  } catch {
    /* ignore */
  }

  render();
  ensureTick();
}
