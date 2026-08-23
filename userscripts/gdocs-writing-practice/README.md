# TOEFL Writing Practice — Tampermonkey (Google Docs)

One-click Gemini prompt generation, sidebar practice (timer + word count), rubric-style scoring, and append-only logging into the focused Google Doc. **Does not require** this repo’s frontend or backend.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or Violentmonkey).
2. From this directory run `node build.mjs` (or `pnpm build`) to refresh `toefl-writing-practice.user.js`.
3. Open Tampermonkey → **Create a new script** → paste the contents of `toefl-writing-practice.user.js` → save.
4. Open any Google Doc (`https://docs.google.com/document/...`).
5. In the sidebar **API key** section, paste your [Gemini API key](https://aistudio.google.com/apikey) and click **Save key** (stored via `GM_setValue` as `geminiApiKey`).

Optional: set Tampermonkey value `geminiModel` to override the default `gemini-1.5-flash`.

## Use

1. Choose **Email** or **Academic Discussion**.
2. Click **Generate** — prompt appears in the sidebar; a session block is appended to the Doc (or copied for paste if auto-insert fails).
3. Write in the sidebar textarea (soft timer; writing stays allowed at 0:00).
4. Click **Score** — essay + score/feedback append to the Doc. If grading fails, the essay is still written with a **GRADING FAILED** marker.

## Develop / test

```bash
cd userscripts/gdocs-writing-practice
pnpm test    # or: npm test / node --test lib/*.test.js
node build.mjs
```

No `pnpm dev` / backend required for the userscript path.

## Manual smoke checklist

- [ ] Install script; set key; no FE/BE running
- [ ] Email: generate → write → score → Doc has prompt + essay + score
- [ ] Academic: same
- [ ] Let timer hit 0:00; still can type and score
- [ ] Force grade failure (bad key temporarily): essay still lands with GRADING FAILED
- [ ] Second generate in same Doc appends a new session block

## Security

The Gemini API key lives in your browser userscript storage. Personal use only; never commit keys.
