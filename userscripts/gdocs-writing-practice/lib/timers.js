/** @typedef {"Email" | "Academic"} QuestionType */

/** Soft countdown seconds matching frontend Practice.tsx */
export const TIMER_SECONDS = Object.freeze({
  Email: 420,
  Academic: 600,
});

/**
 * @param {string} type
 * @returns {number}
 */
export function timerSecondsForType(type) {
  if (type === "Email" || type === "Academic") {
    return TIMER_SECONDS[type];
  }
  throw new Error(`Unknown question type: ${type}`);
}

/**
 * Soft decrement: never goes below 0 (no hard lock).
 * @param {number} prev
 * @returns {number}
 */
export function softDecrement(prev) {
  return prev > 0 ? prev - 1 : 0;
}
