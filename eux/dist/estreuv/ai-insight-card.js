// ┌─ estreux:expanded ──────────────────────────────────────────────
// │ source : ai-insight-card.eux  (sha256:720bea788ab3)
// │ profile: ui-component
// │ target : estreuv   provider : agent
// │ trio   : temp=0.2 model=agent/claude template=estreux/v0.0.1
// │ ⚠ 자동 생성물 — 직접 수정 금지. `npm run brew` 로 재생성 (drift-check 감시).
// └─────────────────────────────────────────────────────────────────
import { EstreUVElement } from 'estreuv';
import { html, css } from 'lit';

/**
 * <ai-insight-card> — Rimlog 의 estreuv(Lit) 위젯. γ 스코프 "UV 위젯 병치" 실증.
 * 격리 컴포넌트: 호스트가 kind/body/q/liked 를 주입하고, 👍/가리기는 feedback
 * CustomEvent 로 event-up — 저장·목록 갱신은 호스트(EstreUI 페이지) 몫.
 */
export class AiInsightCard extends EstreUVElement {
  static properties = {
    kind: { type: String },
    body: { type: String },
    q: { type: String },
    liked: { type: Boolean },
  };
  static styles = css`
    :host { display: block; }
    .card { background: var(--aic-bg, rgba(122,77,255,.12)); border: 1px solid var(--aic-accent, #7a4dff);
            border-radius: 14px; padding: 13px 14px; }
    .head { color: var(--aic-accent, #7a4dff); font-weight: 700; font-size: .82rem; margin-bottom: 7px; }
    .body { font-size: .9rem; margin-bottom: 8px; }
    .q { color: #9aa0ae; font-size: .86rem; font-style: italic; margin-bottom: 10px; }
    .acts { display: flex; gap: 8px; }
    button { background: #1e2230; border: 1px solid #2a2f3d; color: #9aa0ae;
             border-radius: 9px; padding: 5px 12px; font-size: .8rem; cursor: pointer; font-family: inherit; }
    button.liked { border-color: var(--aic-accent, #7a4dff); color: var(--aic-accent, #7a4dff); }
  `;

  constructor() {
    super();
    this.kind = 'link';
    this.body = '';
    this.q = '';
    this.liked = false;
  }

  #like() {
    this.liked = !this.liked;
    this.dispatchEvent(new CustomEvent('feedback', { detail: { action: 'like', liked: this.liked }, bubbles: true, composed: true }));
  }

  #hide() {
    this.dispatchEvent(new CustomEvent('feedback', { detail: { action: 'hide' }, bubbles: true, composed: true }));
  }

  render() {
    const weekly = this.kind === 'weekly';
    return html`
      <div class="card">
        <div class="head">${weekly ? '✨ AI 주간 요약' : '✨ AI 연결 제안'}</div>
        <div class="body">${this.body}</div>
        ${this.q ? html`<div class="q">${this.q}</div>` : ''}
        <div class="acts">
          <button class=${this.liked ? 'liked' : ''} @click=${this.#like}>${this.liked ? '👍 유용해요' : '👍'}</button>
          ${weekly ? '' : html`<button @click=${this.#hide}>가리기</button>`}
        </div>
      </div>
    `;
  }
}

customElements.define('ai-insight-card', AiInsightCard);
