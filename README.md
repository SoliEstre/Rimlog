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

## Self-host (real AI backend, no key in the browser)

The GitHub Pages deployment is a serverless preview: the AI falls back to tag overlap unless you paste an API key. For real use, run the bundled insight server — a single-file, zero-dependency node server (brewed from [`eux/insight-server.eux`](eux/insight-server.eux)) that serves the app and generates insights with the backend of your choice:

```bash
# quickest free path — NVIDIA's hosted models (no credit card):
# 1. sign up at https://build.nvidia.com and create an API key (nvapi-...)
# 2.
NVIDIA_API_KEY=nvapi-... node eux/dist/server/insight-server.js
# 3. open http://localhost:8787 → 주간 tab → AI 연결 → "셀프호스트 서버"
```

| `INSIGHT_BACKEND` | Uses | Key/auth |
| --- | --- | --- |
| `nvidia` (default) | [build.nvidia.com](https://build.nvidia.com) free hosted models (OpenAI-compatible, ~40 RPM free tier) | `NVIDIA_API_KEY` |
| `claude-cli` | your installed Claude Code — runs `claude -p` per request | Claude subscription (no API key) |
| `codex-cli` | OpenAI Codex CLI — runs `codex exec` per request | ChatGPT subscription (no API key) |
| `openai` / `google` | direct API proxy | `OPENAI_API_KEY` / `GOOGLE_API_KEY` |

Other env: `INSIGHT_MODEL` (default `meta/llama-3.1-70b-instruct` on nvidia) · `PORT` (8787) · `INSIGHT_CORS_ORIGIN` (`*`) · `INSIGHT_STATIC=0` to disable static serving. Keys stay on the server; the browser sends only the memo payload.

## Status

Concept-verification build (2-week validation). See the sibling demo: [wordchain story](https://github.com/SoliEstre/EstreUX.js/tree/main/examples) — one spec, three framework variants.
