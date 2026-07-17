// ┌─ estreux:expanded ──────────────────────────────────────────────
// │ source : insight-server.eux  (sha256:f1d4e9124578)
// │ profile: server
// │ target : server   provider : agent
// │ trio   : temp=0.2 model=agent/claude template=estreux/v0.0.1
// │ ⚠ 자동 생성물 — 직접 수정 금지. `npm run brew` 로 재생성 (drift-check 감시).
// └─────────────────────────────────────────────────────────────────
// Rimlog 셀프호스트 인사이트 서버 — node 단일 파일 · 외부 의존성 0.
// 기동: node eux/dist/server/insight-server.js
// env : INSIGHT_BACKEND=nvidia|openai|google|claude-cli|codex-cli (기본 nvidia)
//       NVIDIA_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY (API 계열)
//       INSIGHT_MODEL (백엔드별 기본 오버라이드) · PORT(8787) ·
//       INSIGHT_CORS_ORIGIN(*) · INSIGHT_STATIC(1)
"use strict";

const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ── 구성 (env → state) ─────────────────────────────────────────────
const BACKEND = process.env.INSIGHT_BACKEND || "nvidia";
const PORT = parseInt(process.env.PORT || "8787", 10);
const CORS_ORIGIN = process.env.INSIGHT_CORS_ORIGIN || "*";
const SERVE_STATIC = process.env.INSIGHT_STATIC !== "0";
const ROOT = path.resolve(__dirname, "..", "..", "..");   // 리포 루트 (eux/dist/server 기준)

const API_BASE = {
  nvidia: "https://integrate.api.nvidia.com/v1",
  openai: "https://api.openai.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta/openai",
};
const API_KEY_ENV = { nvidia: "NVIDIA_API_KEY", openai: "OPENAI_API_KEY", google: "GOOGLE_API_KEY" };
const DEFAULT_MODEL = {
  nvidia: "meta/llama-3.1-70b-instruct",
  openai: "gpt-4o-mini",
  google: "gemini-2.5-flash",
};
const MODEL = process.env.INSIGHT_MODEL || DEFAULT_MODEL[BACKEND] || "";
const IS_CLI = BACKEND === "claude-cli" || BACKEND === "codex-cli";
const API_KEY = IS_CLI ? null : process.env[API_KEY_ENV[BACKEND]] || "";

// ── 프롬프트 (클라이언트 llmInsight/weeklySummary 와 동일 계약) ────
function insightPrompt(latest, others) {
  const context = others.slice(0, 8)
    .map((c) => `- [${c.id}] ${c.srcName}: ${String(c.quote || "").slice(0, 80)} / 메모: ${String(c.memo || "").slice(0, 80)}`)
    .join("\n");
  return `독서·학습 메모 앱이에요. 최신 메모와 과거 메모 목록을 보고 JSON 만 응답하세요: {"body":"최신 메모와 가장 이어지는 과거 메모 1개와 그 이유(한국어 1~2문장, 과거 메모의 소스명 언급)","q":"사고를 확장하는 질문 1개","refIds":["과거 메모 id"]}\n\n[최신] ${latest.srcName}: ${latest.quote} / 내 생각: ${latest.memo}\n[과거]\n${context}`;
}
function weeklyPrompt(captures) {
  const list = captures.map((c) => `- ${c.srcName}: ${String(c.memo || "").slice(0, 80)}`).join("\n");
  return `이번 주 메모들을 관통하는 주제 1~2문장 + 실천 제안 1줄을 JSON 으로: {"body":"...","q":"..."}\n${list}`;
}

// 관대한 JSON 추출 — 첫 { 부터 마지막 } 까지
function looseJson(text) {
  const s = String(text || "");
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("no JSON in response");
  return JSON.parse(s.slice(a, b + 1));
}

// ── 백엔드 1콜 ─────────────────────────────────────────────────────
async function apiCall(prompt) {
  if (!API_KEY) { const e = new Error(`${API_KEY_ENV[BACKEND]} 미설정`); e.status = 503; throw e; }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(API_BASE[BACKEND] + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY },
      body: JSON.stringify({ model: MODEL, temperature: 0.4, messages: [{ role: "user", content: prompt }] }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`backend ${BACKEND} ${res.status}`);
    const data = await res.json();
    return looseJson(data.choices?.[0]?.message?.content);
  } finally { clearTimeout(timer); }
}

// CLI 1턴 — 인자 배열 전달(shell 조립 금지), stdout 에서 JSON 추출
function cliCall(prompt) {
  const [cmd, ...pre] = BACKEND === "claude-cli" ? ["claude", "-p"] : ["codex", "exec"];
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...pre, prompt], { shell: process.platform === "win32", windowsHide: true });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${cmd} timeout(120s)`)); }, 120000);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && !out.includes("{")) return reject(new Error(`${cmd} exit ${code}: ${err.slice(0, 200)}`));
      try { resolve(looseJson(out)); } catch (e) { reject(e); }
    });
  });
}

const generate = (prompt) => (IS_CLI ? cliCall(prompt) : apiCall(prompt));

// ── HTTP ───────────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".eux": "text/plain; charset=utf-8",
};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function sendJson(res, status, obj) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (d) => { raw += d; if (raw.length > 1e6) { req.destroy(); reject(new Error("body too large")); } });
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); return res.end(); }

  if (url.pathname === "/api/insight" && req.method === "POST") {
    try {
      const { latest, others } = await readBody(req);
      if (!latest) return sendJson(res, 400, { error: "latest 필요" });
      const out = await generate(insightPrompt(latest, Array.isArray(others) ? others : []));
      return sendJson(res, 200, { body: out.body, q: out.q || "", refIds: out.refIds || [] });
    } catch (e) { return sendJson(res, e.status || 502, { error: String(e.message || e) }); }
  }
  if (url.pathname === "/api/weekly" && req.method === "POST") {
    try {
      const { captures } = await readBody(req);
      if (!Array.isArray(captures) || !captures.length) return sendJson(res, 400, { error: "captures 필요" });
      const out = await generate(weeklyPrompt(captures));
      return sendJson(res, 200, { body: out.body, q: out.q || "" });
    } catch (e) { return sendJson(res, e.status || 502, { error: String(e.message || e) }); }
  }

  if (SERVE_STATIC && req.method === "GET") {
    const rel = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const file = path.resolve(ROOT, "." + rel);
    if (!file.startsWith(ROOT)) { cors(res); res.writeHead(403); return res.end("forbidden"); }
    fs.readFile(file, (err, data) => {
      cors(res);
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
    return;
  }

  cors(res); res.writeHead(404); res.end("not found");
});

server.listen(PORT, () => {
  const keyState = IS_CLI ? "(CLI — 구독 인증 재사용, 키 불요)" : (API_KEY ? "키 OK" : `⚠ ${API_KEY_ENV[BACKEND]} 미설정 — /api/* 는 503`);
  console.log(`[insight-server] backend=${BACKEND} model=${MODEL || "(cli)"} port=${PORT} static=${SERVE_STATIC ? "on(" + ROOT + ")" : "off"} ${keyState}`);
});
