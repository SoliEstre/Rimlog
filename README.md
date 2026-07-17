# Rimlog

[![live demo](https://img.shields.io/badge/live-soliestre.github.io%2FRimlog-d9a23b.svg)](https://soliestre.github.io/Rimlog/)
[![PWA](https://img.shields.io/badge/PWA-offline%20ready-5a0fc8.svg)](https://soliestre.github.io/Rimlog/)
[![brewed from specs](https://img.shields.io/badge/brewed%20from-3%20.eux%20specs-7a4dff.svg)](eux/)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AI reading & learning journal — your second brain for everything you read, watch, and listen to.**

Capture quotes and thoughts from books, articles, lectures, podcasts — and even your own comments on YouTube/Reels. AI connects your notes, asks questions that extend your thinking, and writes your weekly digest.

**[🇰🇷 한국어로 읽기 ↓](#rimlog--한국어)**

**Live demo (PWA)**: https://soliestre.github.io/Rimlog/ — no sign-up; your data stays in your browser.

## How this app is built — specs in, app out

This is the flagship concept-verification app for the **Estre** stack. The app skeleton *and* its server are brewed from three natural-language spec files:

| Spec (`eux/`) | Output | Target |
| --- | --- | --- |
| [`rimlog-app.eux`](eux/rimlog-app.eux) (~45 lines) | 3 pages + store + AI insight call + weekly digest + AI settings | [EstreUI](https://github.com/SoliEstre/EstreUI.js) (macro framework — pages, lifecycle, PWA shell) |
| [`ai-insight-card.eux`](eux/ai-insight-card.eux) (~25 lines) | purple AI insight card widget | [EstreUV](https://github.com/SoliEstre/EstreUV.js) (micro framework — Lit web components) |
| [`insight-server.eux`](eux/insight-server.eux) (1 page) | self-host insight server (zero-dep node single file) | plain node |

The spec → code pipeline is [EstreUX](https://github.com/SoliEstre/EstreUX): specs are the single source of truth, and outputs are drift-checked against them — edit one side without the other and the commit is blocked. Measured maintained-LoC reduction across the ecosystem: **60–82%**.

Full write-up: [the Rimlog build story](https://soliestre.github.io/Rimlog/docs/build-story) (English) · [한국어 원문](https://estreui.tistory.com/5)

- Works offline: AI falls back to tag/keyword linking when no key or server is set.
- Data stays in your browser (localStorage) — no account, no tracking.

## Run locally

```bash
npm install
npm run dev   # HTTPS dev server (PWA)
```

## Self-host (real AI backend, no key in the browser)

The GitHub Pages deployment is a serverless preview: the AI falls back to tag overlap unless you paste an API key in the weekly tab's settings card. For real use, run the bundled insight server — it serves the app and generates insights with the backend of your choice:

```bash
# quickest free path — NVIDIA's hosted models (no credit card):
# 1. sign up at https://build.nvidia.com and create an API key (nvapi-...)
# 2.
NVIDIA_API_KEY=nvapi-... node eux/dist/server/insight-server.js
# 3. open http://localhost:8787 → weekly tab → AI connection → "self-host server"
```

| `INSIGHT_BACKEND` | Uses | Key/auth |
| --- | --- | --- |
| `nvidia` (default) | [build.nvidia.com](https://build.nvidia.com) free hosted models (OpenAI-compatible, ~40 RPM free tier) | `NVIDIA_API_KEY` |
| `claude-cli` | your installed Claude Code — runs `claude -p` per request | Claude subscription (no API key) |
| `codex-cli` | OpenAI Codex CLI — runs `codex exec` per request | ChatGPT subscription (no API key) |
| `openai` / `google` | direct API proxy | `OPENAI_API_KEY` / `GOOGLE_API_KEY` |

Other env: `INSIGHT_MODEL` (default `meta/llama-3.1-70b-instruct` on nvidia) · `PORT` (8787) · `INSIGHT_CORS_ORIGIN` (`*`) · `INSIGHT_STATIC=0` to disable static serving. Keys stay on the server; the browser sends only the memo payload.

## Status

Concept-verification build (public validation in progress). Sibling demo: [wordchain story](https://github.com/SoliEstre/EstreUX/tree/main/examples) — one spec, three framework variants.

## License

[MIT](LICENSE) © SoliEstre

---

# Rimlog — 한국어

**AI 독서·학습 일지 — 읽고 보고 듣는 모든 것의 두 번째 뇌.**

책·아티클·강의·팟캐스트에서 인용과 생각을 캡처하세요 — 유튜브/릴스에 내가 단 댓글까지도요. AI가 메모끼리 연결하고, 사고를 확장하는 질문을 던지고, 주간 요약을 써 줍니다.

**라이브 데모 (PWA)**: https://soliestre.github.io/Rimlog/ — 가입 없음, 데이터는 브라우저에만 있습니다.

## 이 앱이 만들어진 방식 — 명세가 들어가면 앱이 나옵니다

**Estre** 스택의 플래그십 콘셉트 검증 앱입니다. 앱 골격과 서버까지 자연어 명세 3장에서 brew됩니다:

| 명세 (`eux/`) | 산출물 | 타깃 |
| --- | --- | --- |
| [`rimlog-app.eux`](eux/rimlog-app.eux) (~45줄) | 페이지 3장 + 스토어 + AI 인사이트 콜 + 주간 요약 + AI 설정 | [EstreUI](https://github.com/SoliEstre/EstreUI.js) (매크로 프레임워크 — 페이지·라이프사이클·PWA 셸) |
| [`ai-insight-card.eux`](eux/ai-insight-card.eux) (~25줄) | 보라색 AI 인사이트 카드 위젯 | [EstreUV](https://github.com/SoliEstre/EstreUV.js) (마이크로 프레임워크 — Lit 웹컴포넌트) |
| [`insight-server.eux`](eux/insight-server.eux) (1장) | 셀프호스트 인사이트 서버 (의존성 0 node 단일 파일) | 순수 node |

명세 → 코드 파이프라인은 [EstreUX](https://github.com/SoliEstre/EstreUX)입니다. 명세가 단일 진실 원본이고, 산출물은 명세와 drift 검사로 묶여 있어서 한쪽만 고치면 커밋이 막힙니다. 생태계 실측 기준 사람이 유지하는 줄 수 **60~82% 절감**.

전체 이야기: [빌드 기록 (한국어)](https://estreui.tistory.com/5) · [build story (English)](https://soliestre.github.io/Rimlog/docs/build-story)

- 오프라인 동작: 키나 서버가 없으면 AI가 태그/키워드 연결 폴백으로 대신합니다.
- 데이터는 브라우저(localStorage)에만 — 계정 없음, 추적 없음.

## 로컬 실행

```bash
npm install
npm run dev   # HTTPS 개발 서버 (PWA)
```

## 셀프호스트 (진짜 AI 백엔드 — 브라우저에 키 없이)

GitHub Pages 배포본은 서버리스 미리보기라, 주간 탭 설정 카드에 API 키를 넣지 않으면 태그 겹침 폴백으로만 돕니다. 제대로 쓰려면 동봉된 인사이트 서버를 돌리세요 — 앱 서빙과 인사이트 생성을 같이 하고, 백엔드를 골라 씁니다:

```bash
# 가장 빠른 무료 경로 — NVIDIA 호스팅 모델 (카드 등록 불요):
# 1. https://build.nvidia.com 가입 후 API 키 생성 (nvapi-...)
# 2.
NVIDIA_API_KEY=nvapi-... node eux/dist/server/insight-server.js
# 3. http://localhost:8787 열기 → 주간 탭 → AI 연결 → "셀프호스트 서버"
```

| `INSIGHT_BACKEND` | 사용 | 키/인증 |
| --- | --- | --- |
| `nvidia` (기본) | [build.nvidia.com](https://build.nvidia.com) 무료 호스팅 모델 (OpenAI 호환, 무료 구간 ~분당 40회) | `NVIDIA_API_KEY` |
| `claude-cli` | 설치된 Claude Code — 요청마다 `claude -p` 실행 | Claude 구독 (API 키 불요) |
| `codex-cli` | OpenAI Codex CLI — 요청마다 `codex exec` 실행 | ChatGPT 구독 (API 키 불요) |
| `openai` / `google` | 직접 API 프록시 | `OPENAI_API_KEY` / `GOOGLE_API_KEY` |

기타 env: `INSIGHT_MODEL`(nvidia 기본 `meta/llama-3.1-70b-instruct`) · `PORT`(8787) · `INSIGHT_CORS_ORIGIN`(`*`) · `INSIGHT_STATIC=0`(정적 서빙 끔). 키는 서버에만 있고, 브라우저는 메모 페이로드만 보냅니다.

## 현재 상태

콘셉트 검증 빌드(공개 검증 진행 중). 자매 데모: [끝말잇기 스토리](https://github.com/SoliEstre/EstreUX/tree/main/examples) — 명세 한 장, 프레임워크 변종 셋.

## 라이선스

[MIT](LICENSE) © SoliEstre
