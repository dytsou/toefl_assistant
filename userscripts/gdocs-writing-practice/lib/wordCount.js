/**
 * Match frontend Practice / typingStats word count.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
