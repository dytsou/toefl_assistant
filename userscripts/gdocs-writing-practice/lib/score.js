export const CANONICAL_ERROR_TYPES = Object.freeze([
  "Grammar and Spelling",
  "Elaboration",
  "Tone and Social Conventions",
  "Adherence to Task",
  "Idiomatic Word Choice",
  "Relevance to Discussion",
]);

/**
 * @param {unknown} raw
 * @returns {number}
 */
export function normalizeScore(raw) {
  const rawScore = Number(raw);
  const boundedScore = Math.min(
    5,
    Math.max(0, Number.isFinite(rawScore) ? rawScore : 0),
  );
  return Math.round(boundedScore * 2) / 2;
}

/**
 * Port of backend/src/lib/errorTypes.ts normalizeErrorType.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeErrorType(raw) {
  const normalized = String(raw ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "grammar" ||
    normalized === "spelling" ||
    normalized === "grammar and spelling"
  ) {
    return "Grammar and Spelling";
  }
  if (
    normalized === "tone" ||
    normalized === "social conventions" ||
    normalized === "tone and social conventions"
  ) {
    return "Tone and Social Conventions";
  }
  if (
    normalized === "adherence" ||
    normalized === "task" ||
    normalized === "adherence to task"
  ) {
    return "Adherence to Task";
  }
  if (
    normalized === "idiomatic word choice" ||
    normalized === "word choice" ||
    normalized === "idiomatic"
  ) {
    return "Idiomatic Word Choice";
  }
  if (
    normalized === "relevance to discussion" ||
    normalized === "relevance" ||
    normalized === "discussion relevance"
  ) {
    return "Relevance to Discussion";
  }
  if (normalized === "elaboration") {
    return "Elaboration";
  }

  if (CANONICAL_ERROR_TYPES.includes(raw)) {
    return raw;
  }

  return "Elaboration";
}

/**
 * @param {unknown} errors
 * @returns {{ type: string, incorrect: string, suggestion: string, explanation: string }[]}
 */
export function normalizeErrors(errors) {
  if (!Array.isArray(errors)) return [];
  return errors.map((err) => {
    const e = err && typeof err === "object" ? err : {};
    return {
      type: normalizeErrorType(/** @type {{type?: string}} */ (e).type ?? ""),
      incorrect: String(/** @type {{incorrect?: string}} */ (e).incorrect ?? ""),
      suggestion: String(
        /** @type {{suggestion?: string}} */ (e).suggestion ?? "",
      ),
      explanation: String(
        /** @type {{explanation?: string}} */ (e).explanation ?? "",
      ),
    };
  });
}
