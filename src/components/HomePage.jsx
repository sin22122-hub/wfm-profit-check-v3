import React from 'react';

export default function HomePage({ onStart }) {
  return (
    <main className="premium-home">
      <section className="premium-hero">
        <div className="premium-hero-copy">
          <p className="eyebrow">Profit Flow Management</p>

          <h1>
            你的店真的有賺錢嗎？
            <span>美業獲利健檢™</span>
          </h1>

          <p className="lead">
            透過獲利、成本、客戶經營與數位能力四大面向，
            快速找出影響營收與成長的關鍵問題。
          </p>

          <div className="premium-icons">
            <span className="icon-diagnosis">專業診斷</span>
            <span className="icon-data">數據分析</span>
            <span className="icon-target">精準建議</span>
            <span className="icon-growth">成長路徑</span>
          </div>

          <button className="btn premium-main-btn" onClick={onStart}>
            立即開始免費健檢
          </button>

          <p className="micro">
            適用：美容、美甲、美睫、美髮、紋繡、SPA等項目之工作室、小型店面與連鎖經營。
          </p>
        </div>

        <div className="premium-book-wrap">
          <div className="premium-book">
            <div className="book-shine" />
            <p className="book-logo">PFM</p>
            <span>Profit Flow Management</span>
            <h2>美業獲利健檢報告</h2>

            <div className="book-radar">
              <div className="radar-shape" />
              <small>獲利能力</small>
              <small>經營效率</small>
              <small>客戶經營</small>
              <small>數位成長</small>
            </div>

            <div className="book-score">
              <span>綜合分數</span>
              <strong>72</strong>
              <small>/100</small>
            </div>

            <p className="book-footer">專屬經營診斷報告</p>
          </div>
        </div>
      </section>

      <section className="premium-pain-section">
        <h2>明明每天都很忙，為什麼帳戶裡還是沒有錢？</h2>

        <div className="premium-pain-grid">
          <div>
            <span>營收看起來不錯，</span>
            <strong>但月底沒有留下多少利潤。</strong>
          </div>
          <div>
            <span>客人一直來，</span>
            <strong>卻總是留不住。</strong>
          </div>
          <div>
            <span>社群每天更新，</span>
            <strong>業績卻沒有明顯成長。</strong>
          </div>
          <div>
            <span>不知道問題出在哪，</span>
            <strong>只能不斷更努力工作。</strong>
          </div>
        </div>
      </section>

      <section className="premium-preview">
        <div className="section-title-line">
          <span></span>
          <h2>診斷預覽</h2>
          <span></span>
        </div>

        <div className="premium-feature-grid">
          <div>
            <i className="preview-icon search"></i>
            <strong>三大問題</strong>
            <p>找出影響獲利的關鍵阻礙</p>
          </div>
          <div>
            <i className="preview-icon diamond"></i>
            <strong>三大優勢</strong>
            <p>發掘你的經營亮點</p>
          </div>
          <div>
            <i className="preview-icon radar"></i>
            <strong>成長階段</strong>
            <p>了解目前所在的成長階段</p>
          </div>
          <div>
            <i className="preview-icon chart"></i>
            <strong>成長機會</strong>
            <p>量化潛在成長與獲利空間</p>
          </div>
        </div>
      </section>

      <section className="premium-proof">
        <p>透過 PFM 找到你的成長突破點</p>
        <span>數據驅動決策，讓努力更有價值</span>
      </section>
    </main>
  );
}
