/**
 * Pure practice session state for the sidebar (testable).
 * @typedef {"idle"|"generating"|"practicing"|"scoring"} Phase
 * @typedef {{
 *   phase: Phase,
 *   type: "Email"|"Academic",
 *   title: string,
 *   prompt: string,
 *   essay: string,
 *   timerRemaining: number,
 *   status: string,
 *   pasteHint: string,
 * }} PracticeState
 */

import { softDecrement, timerSecondsForType } from "./timers.js";

/** @returns {PracticeState} */
export function initialState() {
  return {
    phase: "idle",
    type: "Email",
    title: "",
    prompt: "",
    essay: "",
    timerRemaining: timerSecondsForType("Email"),
    status: "",
    pasteHint: "",
  };
}

/**
 * @param {PracticeState} state
 * @param {{ type: string, payload?: any }} action
 * @returns {PracticeState}
 */
export function reduce(state, action) {
  switch (action.type) {
    case "SET_TYPE": {
      const type = action.payload === "Academic" ? "Academic" : "Email";
      if (state.phase === "practicing" || state.phase === "scoring") {
        return state;
      }
      return {
        ...state,
        type,
        timerRemaining: timerSecondsForType(type),
      };
    }
    case "SET_ESSAY":
      return { ...state, essay: String(action.payload ?? "") };
    case "SET_STATUS":
      return { ...state, status: String(action.payload ?? "") };
    case "SET_PASTE_HINT":
      return { ...state, pasteHint: String(action.payload ?? "") };
    case "GENERATE_START":
      return { ...state, phase: "generating", status: "Generating…", pasteHint: "" };
    case "GENERATE_OK": {
      const { title, content } = action.payload;
      return {
        ...state,
        phase: "practicing",
        title: String(title ?? ""),
        prompt: String(content ?? ""),
        essay: "",
        timerRemaining: timerSecondsForType(state.type),
        status: "Write your response in the sidebar.",
      };
    }
    case "GENERATE_FAIL":
      return {
        ...state,
        phase: "idle",
        status: String(action.payload ?? "Generate failed"),
      };
    case "TICK":
      if (state.phase !== "practicing") return state;
      return { ...state, timerRemaining: softDecrement(state.timerRemaining) };
    case "SCORE_START":
      return { ...state, phase: "scoring", status: "Scoring…" };
    case "SCORE_DONE":
      return {
        ...state,
        phase: "idle",
        status: String(action.payload ?? "Scored."),
      };
    case "SCORE_FAIL_KEPT":
      return {
        ...state,
        phase: "idle",
        status: String(
          action.payload ?? "Grading failed; essay saved to Doc when possible.",
        ),
      };
    default:
      return state;
  }
}
