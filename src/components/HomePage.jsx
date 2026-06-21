import React from 'react';

function GoldIcon({ type }) {
  const icons = {
    diagnosis: <><rect x="6" y="5" width="12" height="15" rx="2" /><path d="M9 5.5V4h6v1.5" /><path d="M9 12l2 2 4-5" /><path d="M9 17h6" /></>,
    data: <><path d="M5 19V11" /><path d="M11 19V6" /><path d="M17 19v-9" /><path d="M3 19h18" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M18 6l3-3" /><path d="M15 9l6-6" /></>,
    growth: <><path d="M4 17l5-5 4 4 7-8" /><path d="M15 8h5v5" /><path d="M4 20h16" /></>,
    coin: <><ellipse cx="9" cy="7" rx="5" ry="3" /><path d="M4 7v6c0 1.7 2.2 3 5 3s5-1.3 5-3V7" /><path d="M14 10c3 .25 5 1.5 5 3 0 1.7-2.2 3-5 3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.8-4.2 14.2-4.2 16 0" /></>,
    loop: <><path d="M17 3l4 4-4 4" /><path d="M3 11V9a5 5 0 0 1 5-5h13" /><path d="M7 21l-4-4 4-4" /><path d="M21 13v2a5 5 0 0 1-5 5H3" /></>,
    question: <><path d="M9.2 9a3 3 0 1 1 5.6 1.5c-.9 1.2-2.8 1.6-2.8 3.5" /><path d="M12 18h.01" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    diamond: <><path d="M6 4h12l4 6-10 11L2 10l4-6Z" /><path d="M2 10h20" /><path d="M12 21L8 10l4-6 4 6-4 11Z" /></>,
    radar: <><path d="M12 3l8.5 6.2-3.2 10H6.7L3.5 9.2 12 3Z" /><path d="M12 7l4.7 3.4-1.8 5.6H9.1l-1.8-5.6L12 7Z" /><path d="M12 3v16" /><path d="M3.5 9.2h17" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-4" /><path d="M12 16V8" /><path d="M16 16v-6" /></>,
  };

  return (
    <span className="pfm-gold-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </svg>
    </span>
  );
}

export default function HomePage({ onStart }) {
  return (
    <main className="pfm-home-luxury">
      <section className="pfm-lux-hero">
        <div className="pfm-lux-copy">
          <p className="pfm-lux-eyebrow">Profit Flow Management</p>
          <h1>你的店真的有賺錢嗎？<span>美業獲利健檢™</span></h1>
          <p className="pfm-lux-lead">透過獲利、成本、客戶經營與數位能力四大面向，快速找出影響營收與成長的關鍵問題。</p>

          <div className="pfm-lux-icon-row">
            <div><GoldIcon type="diagnosis" /><span>專業診斷</span></div>
            <div><GoldIcon type="data" /><span>數據分析</span></div>
            <div><GoldIcon type="target" /><span>精準建議</span></div>
            <div><GoldIcon type="growth" /><span>成長路徑</span></div>
          </div>

          <button className="btn pfm-lux-main-btn" onClick={onStart}>立即開始免費健檢</button>
          <p className="pfm-lux-scope">適用：美容、美甲、美睫、美髮、紋繡、SPA等項目之工作室、小型店面與連鎖經營。</p>
        </div>

        <div className="pfm-lux-book-area">
          <div className="pfm-lux-book-stage" />
          <div className="pfm-lux-book">
            <div className="pfm-lux-book-shine" />
            <div className="pfm-lux-book-logo">PFM</div>
            <div className="pfm-lux-book-sub">Profit Flow Management</div>
            <h2>美業獲利健檢報告</h2>
            <div className="pfm-lux-radar">
              <div className="radar-grid" />
              <div className="radar-fill" />
              <span>獲利能力</span><span>經營效率</span><span>客戶經營</span><span>數位成長</span><span>成本控制</span>
            </div>
            <div className="pfm-lux-score"><small>綜合分數</small><strong>72</strong><em>/100</em></div>
            <p>專屬經營診斷報告</p>
          </div>
        </div>
      </section>

      <section className="pfm-lux-pain">
        <h2>明明每天都很忙，為什麼帳戶裡還是沒有錢？</h2>
        <div className="pfm-lux-pain-grid">
          <article><GoldIcon type="coin" /><p>營收看起來不錯，<strong>但月底沒有留下多少利潤。</strong></p></article>
          <article><GoldIcon type="user" /><p>客人一直來，<strong>卻總是留不住。</strong></p></article>
          <article><GoldIcon type="loop" /><p>社群每天更新，<strong>業績卻沒有明顯成長。</strong></p></article>
          <article><GoldIcon type="question" /><p>不知道問題出在哪，<strong>只能不斷更努力工作。</strong></p></article>
        </div>
      </section>

      <section className="pfm-lux-preview">
        <div className="pfm-lux-title"><span />診斷預覽<span /></div>
        <div className="pfm-lux-preview-grid">
          <article><GoldIcon type="search" /><h3>三大問題</h3><p>找出影響獲利的關鍵阻礙</p></article>
          <article><GoldIcon type="diamond" /><h3>三大優勢</h3><p>發掘你的經營亮點</p></article>
          <article><GoldIcon type="radar" /><h3>成長階段</h3><p>了解目前所在的成長階段</p></article>
          <article><GoldIcon type="chart" /><h3>成長機會</h3><p>量化潛在成長與獲利空間</p></article>
        </div>
      </section>

      <section className="pfm-lux-proof">
        <span className="laurel">‹</span>
        <div><h2>透過 PFM 找到你的成長突破點</h2><p>數據驅動決策，讓努力更有價值</p></div>
        <span className="laurel">›</span>
      </section>
    </main>
  );
}
