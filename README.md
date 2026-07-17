# Rimlog

**AI reading & learning journal — your second brain for everything you read, watch, and listen to.**

Capture quotes and thoughts from books, articles, lectures, podcasts — and even your own comments on YouTube/Reels. AI connects your notes, asks questions that extend your thinking, and writes your weekly digest.

**Live demo (PWA)**: https://soliestre.github.io/Rimlog/

## How this app is built — one spec, whole app

This is the flagship concept-verification app for the **Estre** stack. The entire app skeleton is *brewed* from two natural-language spec files:

| Spec (`eux/`) | Output | Target |
| --- | --- | --- |
| [`rimlog-app.eux`](eux/rimlog-app.eux) (~40 lines) | 3 pages + store + AI insight call + weekly digest | [EstreUI](https://github.com/SoliEstre/EstreUI.js) (macro framework — pages, lifecycle, PWA shell) |
| [`ai-insight-card.eux`](eux/ai-insight-card.eux) (~25 lines) | purple AI insight card widget | [EstreUV](https://github.com/SoliEstre/EstreUV.js) (micro framework — Lit web components) |

The spec → code pipeline is [EstreUX](https://github.com/SoliEstre/EstreUX.js): specs are the single source of truth, outputs are drift-checked against them. Measured maintained-LoC reduction across the ecosystem: **60–82%**.

Full write-up: [the Rimlog build story](https://soliestre.github.io/Rimlog/docs/build-story) (English) · [한국어 원문](https://estreui.tistory.com/5)

- Works offline: AI falls back to tag/keyword linking when no API key is set (BYOK for OpenAI-compatible providers).
- Data stays in your browser (localStorage) — no account, no server.

## Run locally

```bash
npm install
npm run dev   # HTTPS dev server (PWA)
```

## Status

Concept-verification build (2-week validation). See the sibling demo: [wordchain story](https://github.com/SoliEstre/EstreUX.js/tree/main/examples) — one spec, three framework variants.
