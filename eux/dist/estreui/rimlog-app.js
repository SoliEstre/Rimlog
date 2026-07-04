// ┌─ estreux:expanded ──────────────────────────────────────────────
// │ source : rimlog-app.eux  (sha256:ef85171e16f5)
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

  // ── 스토어 (localStorage: captures/insights/provider · sessionStorage: apiKey) ──
  const STORE_KEY = "rimlog-store";
  const Store = {
    captures: [], insights: [], provider: "agent",
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
        this.captures = raw.captures || [];
        this.insights = raw.insights || [];
        this.provider = raw.provider || "agent";
      } catch (e) { /* 초기 상태 유지 */ }
    },
    save() {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        captures: this.captures, insights: this.insights, provider: this.provider,
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

  async function llmInsight(latest, others) {
    const p = Store.provider, key = Store.apiKey;
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
      if (p !== "agent" && key && BASE[p]) {
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

  // ── 스타일 (1회 주입 — 목업 rimlog.html 정합 토큰) ────────────────
  const CSS = `
  .rim-page { padding: 16px 16px 24px; color: #e7e9ea; max-width: 560px; margin: 0 auto; }
  .rim-page h2 { font-size: .95rem; color: #9aa0ae; font-weight: 600; margin: 4px 0 12px; }
  .rim-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .rim-chip { padding: 7px 13px; border-radius: 18px; background: #171a21; border: 1px solid #2a2f3d; color: #9aa0ae; font-size: .85rem; cursor: pointer; }
  .rim-chip.on { background: rgba(217,162,59,.14); border-color: #d9a23b; color: #d9a23b; }
  .rim-field { margin-bottom: 12px; }
  .rim-field label { display: block; font-size: .78rem; color: #9aa0ae; margin-bottom: 5px; }
  .rim-field input, .rim-field textarea { width: 100%; box-sizing: border-box; background: #171a21; border: 1px solid #2a2f3d; border-radius: 10px; color: #e7e9ea; padding: 10px 12px; font: inherit; resize: none; }
  .rim-field textarea { min-height: 74px; }
  .rim-quote textarea { border-left: 3px solid #d9a23b; }
  .rim-save { width: 100%; padding: 13px; border: 0; border-radius: 12px; background: #d9a23b; color: #1a1405; font: 700 1rem/1 inherit; cursor: pointer; margin-top: 4px; }
  .rim-card { background: #171a21; border: 1px solid #2a2f3d; border-radius: 14px; padding: 13px 14px; margin-bottom: 12px; }
  .rim-card .src { display: inline-block; font-size: .72rem; color: #d9a23b; background: rgba(217,162,59,.14); border-radius: 8px; padding: 2px 8px; margin-bottom: 8px; }
  .rim-card blockquote { border-left: 3px solid #d9a23b; padding: 2px 0 2px 10px; margin: 0 0 8px; font-size: .92rem; }
  .rim-card .memo { color: #9aa0ae; font-size: .88rem; margin-bottom: 8px; }
  .rim-card .meta { color: #6b7180; font-size: .74rem; display: flex; gap: 8px; }
  .rim-card .meta .tag { color: #d9a23b; }
  ai-insight-card { display: block; margin-bottom: 12px; }
  .rim-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
  .rim-stat { background: #171a21; border: 1px solid #2a2f3d; border-radius: 12px; padding: 12px 8px; text-align: center; }
  .rim-stat .n { font-size: 1.45rem; font-weight: 800; color: #d9a23b; }
  .rim-stat .l { font-size: .72rem; color: #9aa0ae; margin-top: 2px; }
  .rim-dist .row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: .82rem; }
  .rim-dist .lbl { width: 84px; color: #9aa0ae; }
  .rim-dist .bar { flex: 1; height: 9px; background: #171a21; border-radius: 5px; overflow: hidden; }
  .rim-dist .bar i { display: block; height: 100%; background: #d9a23b; border-radius: 5px; }
  .rim-dist .v { width: 22px; text-align: right; color: #9aa0ae; font-size: .76rem; }
  .rim-empty { color: #6b7180; font-size: .86rem; text-align: center; padding: 28px 0; }
  .rim-busy { color: #7a4dff; font-size: .82rem; margin-bottom: 10px; }
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
    $h.empty().append($page);
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
