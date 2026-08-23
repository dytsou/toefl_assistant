/**
 * Plain-text session blocks for Google Docs append log (KTD6).
 */

const SESSION_HEADER = "=== TOEFL Writing Session ===";

/**
 * @param {{ type: string, title: string, content: string, timestamp?: string }} session
 * @returns {string}
 */
export function formatPromptBlock(session) {
  const ts = session.timestamp ?? new Date().toISOString();
  return [
    SESSION_HEADER,
    `Type: ${session.type}`,
    `Time: ${ts}`,
    "",
    "## Prompt",
    `Title: ${session.title}`,
    "",
    session.content,
    "",
  ].join("\n");
}

/**
 * @param {{
 *   essay: string,
 *   score?: number | null,
 *   feedback?: string | null,
 *   errors?: { type: string, incorrect: string, suggestion: string, explanation: string }[],
 *   gradingFailed?: boolean,
 *   gradingFailedReason?: string,
 * }} result
 * @returns {string}
 */
export function formatScoreBlock(result) {
  const lines = ["", "## Essay", "", result.essay ?? "", ""];

  if (result.gradingFailed) {
    lines.push("## GRADING FAILED");
    lines.push(result.gradingFailedReason || "Evaluation failed.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("## Score");
  lines.push(String(result.score ?? ""));
  lines.push("");
  lines.push("## Feedback");
  lines.push(result.feedback ?? "");
  lines.push("");
  lines.push("## Errors");
  const errors = Array.isArray(result.errors) ? result.errors : [];
  if (errors.length === 0) {
    lines.push("(none)");
  } else {
    for (const err of errors) {
      lines.push(
        `- [${err.type}] "${err.incorrect}" → ${err.suggestion} (${err.explanation})`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

export { SESSION_HEADER };
