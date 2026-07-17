// ┌─ estreux:expanded ──────────────────────────────────────────────
// │ source : rimlog-app.eux  (sha256:c81ea10e0361)
// │ profile: ui-component
// │ target : estreui   provider : agent
// │ trio   : temp=0.2 model=agent/claude template=estreux/v0.0.1
// │ ⚠ 자동 생성물 — 직접 수정 금지. `npm run brew` 로 재생성 (drift-check 감시).
// └─────────────────────────────────────────────────────────────────
// Rimlog — AI 독서·학습 일지 골격 (estreui 변종, classic script — main.js 앞에 로드)
// 페이지 3장(capture/log/week)을 EstrePageHandler 로 구현, AI 인사이트 카드는
// <ai-insight-card>(estreuv 위젯, module 로드)를 병치. 승인 목업(rimlog.html) 정합.

(function () {
  "use strict";

  // ── 스토어 (localStorage: captures/insights/provider/serverUrl · sessionStorage: apiKey) ──
  const STORE_KEY = "rimlog-store";
  const Store = {
    captures: [], insights: [], provider: "agent", serverUrl: "",
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
        this.captures = raw.captures || [];
        this.insights = raw.insights || [];
        this.provider = raw.provider || "agent";
        this.serverUrl = raw.serverUrl || "";
      } catch (e) { /* 초기 상태 유지 */ }
    },
    save() {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        captures: this.captures, insights: this.insights, provider: this.provider, serverUrl: this.serverUrl,
      }));
    },
    get apiKey() { return sessionStorage.getItem("rimlog-api-key") || ""; },
    set apiKey(v) { sessionStorage.setItem("rimlog-api-key", v || ""); },
  };
  Store.load();

  const SRC_TYPES = [
    { key: "book", ico: "📖", label: "책" },
    { key: "article", ico: "📰", label: "아티클" },
    { key: "lecture", ico: "🎓", label: "강의" },
    { key: "podcast", ico: "🎙", label: "팟캐스트" },
    { key: "video", ico: "🎬", label: "영상" },   // 유튜브/릴스 — 내가 단 댓글을 인용으로 캡처
  ];
  const srcOf = (k) => SRC_TYPES.find((s) => s.key === k) || SRC_TYPES[0];
  const uid = () => "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── AI — 인사이트 1콜 + 오프라인 폴백 (V4 계약) ─────────────────
  const BASE = { openai: "https://api.openai.com/v1", google: "https://generativelanguage.googleapis.com/v1beta/openai" };
  const MODEL = { openai: "gpt-4o-mini", google: "gemini-2.5-flash" };
  let aiBusy = false;

  // 폴백: 태그·단어 겹침 기반 연결 + 정형 질문 — 키/네트워크 없이도 데모 성립
  function fallbackInsight(latest, others) {
    const words = new Set((latest.tags.join(" ") + " " + latest.memo).split(/[\s,#]+/).filter((w) => w.length > 1));
    let best = null, bestScore = 0;
    for (const c of others) {
      const cw = (c.tags.join(" ") + " " + c.memo + " " + c.quote).split(/[\s,#]+/);
      const score = cw.filter((w) => words.has(w)).length;
      if (score > bestScore) { best = c; bestScore = score; }
    }
    if (!best) return null;
    return {
      body: `방금 저장한 메모는 ${new Date(best.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}의 「${best.srcName}」 메모와 이어져요 — 겹치는 키워드가 있어요.`,
      q: `Q. 두 메모의 관점 차이를 한 문장으로 정리해 본다면요?`,
      refIds: [best.id],
    };
  }

  // provider=server — 셀프호스트 인사이트 서버(insight-server) 위임. 빈 serverUrl = same-origin.
  const serverBase = () => (Store.serverUrl || "").replace(/\/+$/, "");
  async function serverCall(pathname, payload) {
    const res = await fetch(serverBase() + pathname, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("server " + res.status);
    return res.json();
  }

  async function llmInsight(latest, others) {
    const p = Store.provider, key = Store.apiKey;
    if (p === "server") return serverCall("/api/insight", { latest, others: others.slice(0, 8) });
    if (p === "agent" || !key || !BASE[p]) return null;   // agent/키 없음 → 폴백 경로
    const context = others.slice(0, 8).map((c) => `- [${c.id}] ${c.srcName}: ${c.quote.slice(0, 80)} / 메모: ${c.memo.slice(0, 80)}`).join("\n");
    const res = await fetch(BASE[p] + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: MODEL[p],
        messages: [{
          role: "user",
          content: `독서·학습 메모 앱이에요. 최신 메모와 과거 메모 목록을 보고 JSON 만 응답하세요: {"body":"최신 메모와 가장 이어지는 과거 메모 1개와 그 이유(한국어 1~2문장, 과거 메모의 소스명 언급)","q":"사고를 확장하는 질문 1개","refIds":["과거 메모 id"]}\n\n[최신] ${latest.srcName}: ${latest.quote} / 내 생각: ${latest.memo}\n[과거]\n${context}`,
        }],
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error("llm " + res.status);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  }

  async function requestInsight(latest) {
    const others = Store.captures.filter((c) => c.id !== latest.id);
    if (!others.length) return;
    aiBusy = true; renderAll();
    let ins = null;
    try { ins = await llmInsight(latest, others); } catch (e) { /* 폴백으로 */ }
    if (!ins) ins = fallbackInsight(latest, others);
    aiBusy = false;
    if (ins) {
      Store.insights.unshift({ id: uid(), kind: "link", body: ins.body, q: ins.q || "", refIds: ins.refIds || [], liked: false, hidden: false, at: Date.now() });
      Store.save();
    }
    renderAll();   // hide 상태 페이지는 상태만 반영 — 렌더 함수가 attach 여부를 스스로 확인
  }

  function weekRange() {
    const now = new Date(); const day = (now.getDay() + 6) % 7;   // 월요일 시작
    const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: start.getTime() + 7 * 864e5 };
  }
  const thisWeek = (arr) => { const { start, end } = weekRange(); return arr.filter((x) => x.at >= start && x.at < end); };

  async function weeklySummary() {
    const caps = thisWeek(Store.captures);
    if (caps.length < 3) return;
    if (thisWeek(Store.insights).some((i) => i.kind === "weekly")) return;
    let body = null, q = "";
    try {
      const p = Store.provider, key = Store.apiKey;
      if (p === "server") {
        const j = await serverCall("/api/weekly", { captures: caps.map((c) => ({ srcName: c.srcName, memo: c.memo })) });
        body = j.body; q = j.q || "";
      } else if (p !== "agent" && key && BASE[p]) {
        const list = caps.map((c) => `- ${c.srcName}: ${c.memo.slice(0, 80)}`).join("\n");
        const res = await fetch(BASE[p] + "/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify({ model: MODEL[p], temperature: 0.4, messages: [{ role: "user", content: `이번 주 메모들을 관통하는 주제 1~2문장 + 실천 제안 1줄을 JSON 으로: {"body":"...","q":"..."}\n${list}` }] }),
        });
        const data = await res.json(); const text = data.choices?.[0]?.message?.content || "";
        const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
        body = j.body; q = j.q || "";
      }
    } catch (e) { /* 폴백으로 */ }
    if (!body) {
      const tags = {}; caps.forEach((c) => c.tags.forEach((t) => { tags[t] = (tags[t] || 0) + 1; }));
      const top = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
      body = `이번 주는 ${caps.length}개를 캡처했어요${top.length ? ` — ${top.join(" · ")} 주제가 중심이에요` : ""}.`;
      q = "이번 주말, 가장 인상 깊었던 메모 하나를 한 문단으로 다시 써 보는 건 어때요?";
    }
    Store.insights.unshift({ id: uid(), kind: "weekly", body, q, refIds: [], liked: false, hidden: false, at: Date.now() });
    Store.save();
    renderAll();
  }

  // ── 스타일 (1회 주입 — 라이트/다크 듀얼 컬러셋, EstreUI body[data-dark-mode] 연동) ──
  const CSS = `
  body { /* 라이트 (기본) — 종이·크림 톤 */
    --rim-panel: #ffffff; --rim-line: #e4ddd2; --rim-ink: #2b2620; --rim-dim: #8a8375;
    --rim-faint: #b3ab9d; --rim-accent: #b07d1e; --rim-accent-btn: #d9a23b; --rim-btn-fg: #1a1405;
    --rim-accent-soft: rgba(176,125,30,.10); --rim-ai: #6a3fe0; --rim-ai-soft: rgba(106,63,224,.07);
  }
  body[data-dark-mode="1"] { /* 다크 — 승인 목업 톤 */
    --rim-panel: #171a21; --rim-line: #2a2f3d; --rim-ink: #e7e9ea; --rim-dim: #9aa0ae;
    --rim-faint: #6b7180; --rim-accent: #d9a23b; --rim-accent-btn: #d9a23b; --rim-btn-fg: #1a1405;
    --rim-accent-soft: rgba(217,162,59,.14); --rim-ai: #7a4dff; --rim-ai-soft: rgba(122,77,255,.12);
  }
  #appTitleBtn span { color: var(--rim-accent) !important; }
  .rim-page { padding: 16px 16px 24px; color: var(--rim-ink); max-width: 560px; margin: 0 auto; }
  .rim-page h2 { font-size: .95rem; color: var(--rim-dim); font-weight: 600; margin: 4px 0 12px; }
  .rim-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .rim-chip { padding: 7px 13px; border-radius: 18px; background: var(--rim-panel); border: 1px solid var(--rim-line); color: var(--rim-dim); font-size: .85rem; cursor: pointer; }
  .rim-chip.on { background: var(--rim-accent-soft); border-color: var(--rim-accent); color: var(--rim-accent); }
  .rim-field { margin-bottom: 12px; }
  .rim-field label { display: block; font-size: .78rem; color: var(--rim-dim); margin-bottom: 5px; }
  .rim-field input, .rim-field textarea { width: 100%; box-sizing: border-box; background: var(--rim-panel); border: 1px solid var(--rim-line); border-radius: 10px; color: var(--rim-ink); padding: 10px 12px; font: inherit; resize: none; }
  .rim-field textarea { min-height: 74px; }
  .rim-quote textarea { border-left: 3px solid var(--rim-accent); }
  .rim-save { width: 100%; padding: 13px; border: 0; border-radius: 12px; background: var(--rim-accent-btn); color: var(--rim-btn-fg); font: 700 1rem/1 inherit; cursor: pointer; margin-top: 4px; }
  .rim-card { background: var(--rim-panel); border: 1px solid var(--rim-line); border-radius: 14px; padding: 13px 14px; margin-bottom: 12px; }
  .rim-card .src { display: inline-block; font-size: .72rem; color: var(--rim-accent); background: var(--rim-accent-soft); border-radius: 8px; padding: 2px 8px; margin-bottom: 8px; }
  .rim-card blockquote { border-left: 3px solid var(--rim-accent); padding: 2px 0 2px 10px; margin: 0 0 8px; font-size: .92rem; color: var(--rim-ink); }
  .rim-card .memo { color: var(--rim-dim); font-size: .88rem; margin-bottom: 8px; }
  .rim-card .meta { color: var(--rim-faint); font-size: .74rem; display: flex; gap: 8px; }
  .rim-card .meta .tag { color: var(--rim-accent); }
  ai-insight-card { display: block; margin-bottom: 12px;
    --aic-accent: var(--rim-ai); --aic-bg: var(--rim-ai-soft); --aic-ink: var(--rim-ink);
    --aic-dim: var(--rim-dim); --aic-btn-bg: var(--rim-panel); --aic-btn-line: var(--rim-line);
  }
  .rim-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
  .rim-stat { background: var(--rim-panel); border: 1px solid var(--rim-line); border-radius: 12px; padding: 12px 8px; text-align: center; }
  .rim-stat .n { font-size: 1.45rem; font-weight: 800; color: var(--rim-accent); }
  .rim-stat .l { font-size: .72rem; color: var(--rim-dim); margin-top: 2px; }
  .rim-dist .row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: .82rem; }
  .rim-dist .lbl { width: 84px; color: var(--rim-dim); }
  .rim-dist .bar { flex: 1; height: 9px; background: var(--rim-panel); border: 1px solid var(--rim-line); border-radius: 5px; overflow: hidden; }
  .rim-dist .bar i { display: block; height: 100%; background: var(--rim-accent-btn); border-radius: 5px; }
  .rim-dist .v { width: 22px; text-align: right; color: var(--rim-dim); font-size: .76rem; }
  .rim-settings { margin-top: 18px; padding: 12px 14px; border: 1px solid var(--rim-line); border-radius: 12px; background: var(--rim-panel); }
  .rim-set-title { font-size: .82rem; font-weight: 700; color: var(--rim-dim); margin-bottom: 8px; }
  .rim-settings select, .rim-settings input { width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 9px 10px; font-size: .86rem; color: var(--rim-ink); background: transparent; border: 1px solid var(--rim-line); border-radius: 8px; }
  .rim-set-hint { font-size: .74rem; color: var(--rim-dim); }
  .rim-empty { color: var(--rim-faint); font-size: .86rem; text-align: center; padding: 28px 0; }
  .rim-busy { color: var(--rim-ai); font-size: .82rem; margin-bottom: 10px; }
  `;
  function injectStyle() {
    if (document.getElementById("rimlog-style")) return;
    const el = document.createElement("style"); el.id = "rimlog-style"; el.textContent = CSS;
    document.head.appendChild(el);
  }

  // ── 렌더 ────────────────────────────────────────────────────────
  const hosts = { capture: null, log: null, week: null };   // 페이지별 $host (onBring 에서 결선)

  function insightEl(ins) {
    const el = document.createElement("ai-insight-card");
    el.setAttribute("kind", ins.kind);
    el.setAttribute("body", ins.body);
    if (ins.q) el.setAttribute("q", ins.q);
    if (ins.liked) el.setAttribute("liked", "");
    el.addEventListener("feedback", (e) => {
      if (e.detail.action === "like") ins.liked = !!e.detail.liked;
      if (e.detail.action === "hide") ins.hidden = true;
      Store.save(); renderLog(); renderWeek();
    });
    return el;
  }

  function renderCapture() {
    const $h = hosts.capture; if (!$h) return;
    if ($h.find(".rim-page").length === 0) {
      $h.html(`<div class="rim-page">
        <h2>지금 보고 있는 것에서 캡처</h2>
        <div class="rim-chips">${SRC_TYPES.map((s, i) => `<span class="rim-chip${i === 0 ? " on" : ""}" data-src="${s.key}">${s.ico} ${s.label}</span>`).join("")}</div>
        <div class="rim-field"><label>소스</label><input class="rim-src" placeholder="예: 몰입의 즐거움 / 유튜브 영상 제목"></div>
        <div class="rim-field rim-quote"><label>인용 / 하이라이트 <span style="color:#6b7180">(영상이면 내가 단 댓글)</span></label><textarea class="rim-q"></textarea></div>
        <div class="rim-field"><label>내 생각</label><textarea class="rim-m"></textarea></div>
        <div class="rim-field"><label>태그</label><input class="rim-t" placeholder="#몰입 #심리학"></div>
        <button class="rim-save">캡처 저장</button>
      </div>`);
      $h.find(".rim-chip").on("click", function () {
        $h.find(".rim-chip").removeClass("on"); $(this).addClass("on");
      });
      $h.find(".rim-save").on("click", () => {
        const cap = {
          id: uid(), srcType: $h.find(".rim-chip.on").data("src") || "book",
          srcName: $h.find(".rim-src").val().trim() || "(소스 미입력)",
          quote: $h.find(".rim-q").val().trim(), memo: $h.find(".rim-m").val().trim(),
          tags: $h.find(".rim-t").val().split(/[\s,]+/).filter(Boolean), at: Date.now(),
        };
        if (!cap.quote && !cap.memo) return;
        Store.captures.unshift(cap); Store.save();
        $h.find(".rim-q, .rim-m").val("");
        requestInsight(cap);                       // 비동기 — 화면 블로킹 없음
        note("저장됐어요 — AI가 연결을 찾는 중…");   // EstreUI 전역 노트 토스트 API (estreUi-notation.js)
        appPageManager.bringPage("log");           // 기록 탭 전환
      });
    }
  }

  function renderLog() {
    const $h = hosts.log; if (!$h || !$h.closest("body").length) return;
    const items = [];
    const visIns = Store.insights.filter((i) => !i.hidden && i.kind === "link");
    // 캡처+인사이트 시간순 병합 스트림
    const stream = [...Store.captures.map((c) => ({ t: "cap", at: c.at, v: c })), ...visIns.map((i) => ({ t: "ins", at: i.at, v: i }))].sort((a, b) => b.at - a.at);
    const $page = $(`<div class="rim-page"><h2>내 기록 <span style="float:right;color:#6b7180;font-size:.76rem">${Store.captures.length}개</span></h2>${aiBusy ? '<div class="rim-busy">✨ AI가 연결을 찾는 중…</div>' : ""}</div>`);
    if (!stream.length) $page.append('<div class="rim-empty">아직 캡처가 없어요 — ✍️ 탭에서 시작해 보세요</div>');
    for (const it of stream) {
      if (it.t === "ins") { $page.append(insightEl(it.v)); continue; }
      const c = it.v, s = srcOf(c.srcType);
      $page.append(`<div class="rim-card"><span class="src">${s.ico} ${esc(c.srcName)}</span>
        ${c.quote ? `<blockquote>${esc(c.quote)}</blockquote>` : ""}
        ${c.memo ? `<div class="memo">${esc(c.memo)}</div>` : ""}
        <div class="meta"><span>${new Date(c.at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span><span class="tag">${esc(c.tags.join(" "))}</span></div></div>`);
    }
    $h.empty().append($page);
  }

  function renderWeek() {
    const $h = hosts.week; if (!$h || !$h.closest("body").length) return;
    const caps = thisWeek(Store.captures);
    const links = thisWeek(Store.insights).filter((i) => i.kind === "link" && !i.hidden);
    const weekly = thisWeek(Store.insights).find((i) => i.kind === "weekly");
    const srcs = {}; caps.forEach((c) => { srcs[c.srcType] = (srcs[c.srcType] || 0) + 1; });
    const { start } = weekRange();
    const fmt = (t) => new Date(t).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
    const $page = $(`<div class="rim-page"><h2>이번 주 — ${fmt(start)} ~ ${fmt(start + 6 * 864e5)}</h2>
      <div class="rim-stats">
        <div class="rim-stat"><div class="n">${caps.length}</div><div class="l">캡처</div></div>
        <div class="rim-stat"><div class="n">${new Set(caps.map((c) => c.srcName)).size}</div><div class="l">소스</div></div>
        <div class="rim-stat"><div class="n">${links.length}</div><div class="l">AI 연결</div></div>
      </div>
      <div class="rim-dist">${Object.entries(srcs).map(([k, n]) => { const s = srcOf(k); return `<div class="row"><span class="lbl">${s.ico} ${s.label}</span><span class="bar"><i style="width:${Math.round((n / Math.max(caps.length, 1)) * 100)}%"></i></span><span class="v">${n}</span></div>`; }).join("")}</div>`);
    if (weekly) $page.append(insightEl(weekly));
    else if (caps.length < 3) $page.append(`<div class="rim-empty">이번 주 캡처가 3개 이상 되면 AI 주간 요약이 생겨요 (지금 ${caps.length}개)</div>`);
    $page.append(settingsEl());
    $h.empty().append($page);
  }

  // AI 연결 설정 카드 (aiSettings) — provider 선택 + 조건부 입력, 변경 즉시 저장
  function settingsEl() {
    const p = Store.provider;
    const $el = $(`<div class="rim-settings">
      <div class="rim-set-title">AI 연결</div>
      <select class="rim-set-provider">
        <option value="agent"${p === "agent" ? " selected" : ""}>내장 폴백 (키 없음 — 태그 겹침)</option>
        <option value="server"${p === "server" ? " selected" : ""}>셀프호스트 서버 (NVIDIA 무료 API·Claude/ChatGPT 구독 CLI)</option>
        <option value="openai"${p === "openai" ? " selected" : ""}>OpenAI (API 키)</option>
        <option value="google"${p === "google" ? " selected" : ""}>Google (API 키)</option>
      </select>
      <input class="rim-set-server" type="url" placeholder="서버 주소 (비우면 지금 이 주소에서 서빙)" value="${esc(Store.serverUrl)}" style="display:${p === "server" ? "block" : "none"}">
      <input class="rim-set-key" type="password" placeholder="API 키 (브라우저 세션에만 보관)" value="${esc(Store.apiKey)}" style="display:${p === "openai" || p === "google" ? "block" : "none"}">
      <div class="rim-set-hint">${p === "server" ? "서버 쪽 백엔드·키 설정은 리포 README 의 Self-host 절 참고." : "키는 탭을 닫으면 사라져요."}</div>
    </div>`);
    $el.find(".rim-set-provider").on("change", function () { Store.provider = this.value; Store.save(); renderWeek(); });
    $el.find(".rim-set-server").on("change", function () { Store.serverUrl = this.value.trim(); Store.save(); });
    $el.find(".rim-set-key").on("change", function () { Store.apiKey = this.value.trim(); });
    return $el;
  }

  function renderAll() { renderCapture(); renderLog(); renderWeek(); }

  // ── 페이지 핸들러 3종 (EstrePageHandler — window 노출 표면, v1.5.1+) ──
  function pageClass(key, render, onShowExtra) {
    return class extends EstrePageHandler {
      onBring(handle) {
        injectStyle();
        hosts[key] = handle.$host;
        render();
        return super.onBring?.(handle);
      }
      onShow(handle) {
        hosts[key] = handle.$host;
        render();
        if (onShowExtra) onShowExtra();
        return super.onShow?.(handle);
      }
    };
  }

  window.Rimlog = {
    Store,
    pages: {
      capture: pageClass("capture", renderCapture),
      log: pageClass("log", renderLog),
      week: pageClass("week", renderWeek, weeklySummary),   // 주간 진입 시 요약 생성 시도
    },
    pids: { capture: "&m=capture", log: "&m=log", week: "&m=week" },
  };
})();
