/**
 * Best-effort Docs append: try paste into editor iframe, else clipboard (KTD5).
 */

/**
 * @returns {Document | null}
 */
export function getDocsEventDocument() {
  const iframe = document.querySelector("iframe.docs-texteventtarget-iframe");
  return iframe?.contentDocument ?? null;
}

/**
 * @param {Document} doc
 * @param {string} text
 * @returns {boolean}
 */
export function tryPasteIntoDocsDocument(doc, text) {
  try {
    const target =
      doc.querySelector('[contenteditable="true"]') ||
      doc.querySelector('div[aria-label="Document content"]') ||
      doc.body;
    if (!target) return false;
    target.focus?.();

    // Move toward end when possible
    const sel = doc.getSelection?.();
    if (sel && doc.body) {
      sel.selectAllChildren(doc.body);
      sel.collapseToEnd();
    }

    const dt = new DataTransfer();
    dt.setData("text/plain", text);
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    const dispatched = target.dispatchEvent(pasteEvent);
    if (!dispatched) return false;

    // Fallback: execCommand insertText (deprecated but often works in Docs iframe)
    if (doc.execCommand) {
      const ok = doc.execCommand("insertText", false, text);
      if (ok) return true;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} text
 * @returns {Promise<"paste" | "clipboard">}
 */
export async function appendToFocusedDoc(text) {
  const payload = String(text ?? "");
  if (!payload) {
    return "clipboard";
  }

  const eventDoc = getDocsEventDocument();
  if (eventDoc && tryPasteIntoDocsDocument(eventDoc, payload)) {
    return "paste";
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload);
  }
  return "clipboard";
}
