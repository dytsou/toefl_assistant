/**
 * Port of backend extractJsonObjectText.
 * @param {string} text
 * @returns {string}
 */
export function extractJsonObjectText(text) {
  const cleaned = String(text ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      `Failed to parse AI response as JSON. Response: ${String(text).slice(0, 300)}`,
    );
  }
  return jsonMatch[0];
}

/**
 * @param {string} text
 * @returns {unknown}
 */
export function parseJsonObject(text) {
  return JSON.parse(extractJsonObjectText(text));
}
