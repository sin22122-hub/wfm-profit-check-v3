import React, { useState } from 'react';
import { money, percent } from '../utils/formatters.js';

export default function ResultDashboard({ result, onRestart }) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div className="stage-card">
          <p className="eyebrow">店家成長階段</p>
          <h1>{result.stage}</h1>
          <p>{result.stageText}</p>
          <div className="growth-score">綜合評分 {result.growthScore}</div>
        </div>

        <div className="kpi-grid">
          <KPI label="毛利率" value={percent(result.grossMargin)} />
          <KPI label="淨利率" value={percent(result.netMargin)} />
          <KPI label="回流率" value={percent(result.returningRate)} />
          <KPI label="客單價" value={money(result.averageTicket)} />
        </div>
      </section>

      <section className="two-col">
        <ListCard title="三大問題" items={result.problems} />
        <ListCard title="三大優勢" items={result.advantages} />
      </section>

      {!unlocked && (
        <section className="unlock-card">
          <h2>完整報告尚未解鎖</h2>
          <p>解鎖後可查看改善順序、成長機會分析、顧問解讀與下一步行動建議。</p>
          <button className="btn" onClick={() => setUnlocked(true)}>立即解鎖完整報告</button>
        </section>
      )}

      {unlocked && (
        <>
          <section className="section-card">
            <h2>建議改善順序</h2>
            <div className="timeline">
              {result.actions.map((item, idx) => (
                <div className="timeline-item" key={`${item}-${idx}`}>
                  <strong>第{idx + 1}優先</strong>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="section-card">
            <h2>獲利成長機會分析</h2>
            <div className="kpi-grid">
              <KPI label="回流提升空間" value={percent(result.opportunity.returningGap)} />
              <KPI label="可轉化營收" value={money(result.opportunity.convertibleRevenue)} />
              <KPI label="可提升獲利" value={money(result.opportunity.profitPotential)} />
              <KPI label="成長潛力評級" value={result.opportunity.level} />
            </div>
            <p className="consultant-text">{result.opportunity.consultantText}</p>
          </section>

          <section className="cta-panel">
            <h2>不要再靠感覺經營，開始用數據看懂你的店。</h2>
            <button className="btn">預約 WFM 一對一獲利診斷</button>
            <button className="btn secondary" onClick={onRestart}>重新健檢</button>
          </section>
        </>
      )}
    </main>
  );
}

function KPI({ label, value }) {
  return (
    <div className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <div className="list-card">
      <h2>{title}</h2>
      {items.map((item, index) => (
        <div className="list-row" key={`${item}-${index}`}>
          <span>{index + 1}</span>
          <strong>{item}</strong>
        </div>
      ))}
    </div>
  );
}
