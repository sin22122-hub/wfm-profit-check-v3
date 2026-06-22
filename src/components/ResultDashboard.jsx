import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const BOOKING_URL = '';

const statusTone = (value = '') => {
  if (['優秀', '健康', '良好', '極高', '高', '成長期', '擴張期', '卓越'].includes(value)) return 'good';
  if (['普通', '穩定', '中', '待改善', '穩定期'].includes(value)) return 'warn';
  if (['需改善', '偏高', '危險', '偏弱', '低', '薄弱', '求生期'].includes(value)) return 'risk';
  return '';
};

const display = (value, fallback = '-') => {
  if (value === undefined || value === null || value === '') return fallback;
  return value;
};

const money = (value) => {
  const text = display(value);
  if (text === '-') return text;
  return String(text).startsWith('$') ? text : `$${text}`;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  return Number(String(value).replace(/[$,%\s,]/g, '')) || 0;
};

const getRoasLevel = (roas) => {
  const value = toNumber(roas);
  if (value >= 20) return '卓越';
  if (value >= 10) return '優秀';
  if (value >= 5) return '良好';
  if (value >= 3) return '普通';
  return '偏低';
};

const getRoasInsight = (roas) => {
  const value = toNumber(roas).toFixed(2);
  const level = getRoasLevel(roas);

  if (level === '卓越') return `每投入 1 元廣告費，可創造約 ${value} 元營收。廣告效率非常卓越，目前廣告不是主要瓶頸，下一步應優先檢查回流率、客單價與服務產能。`;
  if (level === '優秀') return `每投入 1 元廣告費，可創造約 ${value} 元營收。廣告效率表現優秀，可持續優化素材與受眾，同時強化會員經營與回流機制。`;
  if (level === '良好') return `每投入 1 元廣告費，可創造約 ${value} 元營收。廣告效率良好，建議持續測試素材，並提升預約與成交轉換率。`;
  if (level === '普通') return `每投入 1 元廣告費，可創造約 ${value} 元營收。廣告效率普通，建議檢查廣告內容、受眾設定與預約流程。`;

  return `每投入 1 元廣告費，只創造約 ${value} 元營收。廣告效率偏低，建議優先檢查廣告素材、受眾設定與成交流程。`;
};

const MetricCard = ({ label, value, sub, tone, large = false }) => (
  <div className={`pfm-report-card pfm-metric-card ${tone ? `tone-${tone}` : ''} ${large ? 'large' : ''}`}>
    <span>{label}</span>
    <strong>{display(value)}</strong>
    {sub && <p>{sub}</p>}
  </div>
);

const Chapter = ({ number, title, intro, children, className = '' }) => (
  <section className={`pfm-report-section ${className}`}>
    <div className="pfm-report-section-head">
      {number && <p className="pfm-report-eyebrow">第{number}章</p>}
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
    {children}
  </section>
);

const RankCards = ({ items = [], type = 'problem' }) => (
  <div className={`pfm-rank-list ${type}`}>
    {items.map((item, index) => (
      <div className="pfm-rank-card" key={`${type}-${item}-${index}`}>
        <span>{index + 1}</span>
        <strong>{display(item)}</strong>
      </div>
    ))}
  </div>
);

const StepCards = ({ items = [] }) => (
  <div className="pfm-step-list-v13">
    {items.map((item, index) => (
      <div className="pfm-step-card-v13" key={`${item}-${index}`}>
        <span>STEP {index + 1}</span>
        <strong>{display(item)}</strong>
      </div>
    ))}
  </div>
);

function RadarChart({ result }) {
  const values = [
    Math.min(toNumber(result.grossMargin), 100),
    Math.min(toNumber(result.customerScore) * 10, 100),
    Math.min(toNumber(result.digitalScore), 100),
    Math.min(toNumber(result.returnRate), 100),
    Math.min(toNumber(result.netMargin), 100),
  ];

  const center = 120;
  const maxRadius = 86;
  const angleOffset = -90;
  const points = values.map((value, index) => {
    const angle = ((angleOffset + index * 72) * Math.PI) / 180;
    const radius = (value / 100) * maxRadius;
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
  }).join(' ');

  const grid = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const poly = [0, 1, 2, 3, 4].map((index) => {
      const angle = ((angleOffset + index * 72) * Math.PI) / 180;
      const radius = ratio * maxRadius;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    }).join(' ');
    return <polygon key={ratio} points={poly} className="pfm-radar-grid" />;
  });

  return (
    <div className="pfm-radar-card">
      <svg viewBox="0 0 240 240" className="pfm-radar-svg" aria-hidden="true">
        {grid}
        <polygon points={points} className="pfm-radar-area" />
        <polygon points={points} className="pfm-radar-line" />
      </svg>
      <div className="pfm-radar-labels">
        <span>獲利</span>
        <span>客戶</span>
        <span>數位</span>
        <span>回流</span>
        <span>淨利</span>
      </div>
    </div>
  );
}

export default function ResultDashboard({ result, formData = {}, onRestart }) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');

  if (!result) return null;

  const problems = [result.problem1, result.problem2, result.problem3].filter(Boolean);
  const strengths = [result.strength1, result.strength2, result.strength3].filter(Boolean);
  const actions = [result.priority1, result.priority2, result.priority3].filter(Boolean);
  const roasLevel = getRoasLevel(result.roas);
  const roasInsight = getRoasInsight(result.roas);

  const downloadPDF = () => {
    const element = document.getElementById('growth-blueprint');

    if (!element) {
      alert('請先解鎖店家成長藍圖後，再下載 PDF 診斷報告。');
      return;
    }

    document.body.classList.add('pdf-exporting');

    const options = {
      margin: [8, 8, 8, 8],
      filename: `PFM美業獲利健檢_${display(formData.storeName, '店家')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F7F3EC',
        windowWidth: 1280,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .finally(() => {
        document.body.classList.remove('pdf-exporting');
      });
  };

  const unlockBlueprint = () => {
    setUnlocked(true);
    setTimeout(() => {
      document.getElementById('growth-blueprint')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  return (
    <main id="pfm-report" className="pfm-result-page pfm-report-luxury">
      <section className="pfm-report-cover">
        <div className="pfm-cover-copy">
          <p className="pfm-report-eyebrow">PFM 美業獲利健檢結果</p>
          <h1>{display(formData.storeName, '你的店家')}｜經營診斷結果</h1>
          <p>{display(result.stageComment)}</p>

          <div className="pfm-cover-tags">
            <span>{display(result.businessType || formData.businessType)}</span>
            <span>{Array.isArray(formData.storeType) ? formData.storeType.join('、') : display(formData.storeType)}</span>
            <span>{display(formData.month, '本期資料')}</span>
          </div>
        </div>

        <div className="pfm-cover-score">
          <span>店家成長階段</span>
          <strong>{display(result.growthStage)}</strong>
          <div>{display(result.growthScore)}</div>
          <p>綜合分數</p>
        </div>
      </section>

      <Chapter title="獲利健康度總覽" intro="先看最直接影響獲利與經營穩定度的核心指標。">
        <div className="pfm-metric-grid five">
          <MetricCard label="毛利率" value={result.grossMargin} />
          <MetricCard label="淨利率" value={result.netMargin} />
          <MetricCard label="回流率" value={result.returnRate} />
          <MetricCard label="客單價" value={money(result.averageOrderValue)} />
          <MetricCard label="金流手續費率" value={result.paymentFeeRate} />
        </div>
      </Chapter>

      <div className="pfm-split-grid">
        <Chapter title="目前最需要處理的三件事" intro="優先看會影響獲利、回流與成長速度的關鍵問題。">
          <RankCards items={problems} type="problem" />
        </Chapter>

        <Chapter title="目前最值得放大的三個優勢" intro="不是只找問題，也要看見你已經做對的地方。">
          <RankCards items={strengths} type="strength" />
        </Chapter>
      </div>

      <Chapter title="建議改善順序" intro="依照目前診斷結果，建議先從這三個方向開始。">
        <StepCards items={actions} />
      </Chapter>

      <Chapter title="獲利成長機會分析" intro="這裡不是承諾營收，而是協助你看見目前經營結構中可能被放大的空間。">
        <div className="pfm-metric-grid four">
          <MetricCard label="回流提升空間" value={result.returnGrowthRoom} />
          <MetricCard label="可轉化營收" value={money(result.convertibleRevenue)} />
          <MetricCard label="可提升獲利" value={money(result.profitGrowthRoom)} />
          <MetricCard label="成長潛力評級" value={result.growthPotentialLevel} tone={statusTone(result.growthPotentialLevel)} />
        </div>
      </Chapter>

      <section className="pfm-hidden-cost-report">
        <div>
          <p className="pfm-report-eyebrow">你可能忽略的隱形成本</p>
          <h2>金流手續費正在持續吃掉你的淨利</h2>
          <p>{display(result.hiddenCostWarning)}</p>
        </div>

        <div className="pfm-hidden-cost-number">
          <span>本期金流手續費率</span>
          <strong>{display(result.paymentFeeRate)}</strong>
          <p>這類費用通常不會被老闆第一時間感覺到，但它會直接降低實際留下來的淨利。</p>
        </div>
      </section>

      {!unlocked && (
        <section className="pfm-unlock-report no-print">
          <p className="pfm-report-eyebrow">免費解鎖</p>
          <h2>店家成長藍圖已產生</h2>
          <p>看懂結果只是開始。解鎖後可查看你的獲利結構、客戶結構、流量內容能力、成長瓶頸與顧問建議。</p>

          <div className="pfm-email-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="輸入 Email 免費解鎖"
            />
            <button className="btn" onClick={unlockBlueprint}>
              免費解鎖店家成長藍圖
            </button>
          </div>
        </section>
      )}

      {unlocked && (
        <section id="growth-blueprint" className="pfm-blueprint-report">
          <div className="pdf-action-bar no-print">
            <button className="btn" onClick={downloadPDF}>
              下載 PDF 診斷報告
            </button>
          </div>

          <div className="pfm-blueprint-hero">
            <p className="pfm-report-eyebrow">店家成長藍圖</p>
            <h2>從「知道問題」進入「理解原因」</h2>
            <p>以下內容將目前的健檢數據整理成顧問視角，協助你看見獲利、客戶、流量與下一步改善方向。</p>
          </div>

          <Chapter number="一" title="獲利結構分析" intro="獲利不是只看營收，而是看毛利、淨利與成本是否能留下錢。">
            <div className="pfm-metric-grid auto">
              <MetricCard label="本月營收" value={money(result.totalRevenue)} />
              <MetricCard label="毛利率" value={result.grossMargin} />
              <MetricCard label="淨利率" value={result.netMargin} />
              <MetricCard label="人事成本率" value={result.hrCostRate} />
              <MetricCard label="租金率" value={result.rentRate} />
              <MetricCard label="廣告率" value={result.adRate} />
              <MetricCard label="金流手續費率" value={result.paymentFeeRate} />
            </div>
          </Chapter>

          <Chapter number="二" title="客戶經營分析" intro="回流、新客與介紹客的比例，會決定你是靠穩定經營，還是一直追新客。">
            <div className="pfm-metric-grid four">
              <MetricCard label="新客率" value={result.newCustomerRate} />
              <MetricCard label="介紹客比例" value={result.referralRate} />
              <MetricCard label="客戶經營力" value={`${display(result.customerScore)} / 10`} />
              <MetricCard label="客戶經營力評級" value={result.customerLevel} tone={statusTone(result.customerLevel)} />
            </div>
          </Chapter>

          <Chapter number="三" title="流量與內容能力" intro="PFM 不鼓勵盲目投廣告，而是先看目前是否具備自然流量與內容經營基礎。">
            <div className="pfm-metric-grid four">
              <MetricCard label="社群經營度" value={result.socialScore} />
              <MetricCard label="內容執行力" value={result.contentScore} />
              <MetricCard label="數位成熟度" value={result.digitalScore} />
              <MetricCard label="數位成熟度評級" value={result.digitalLevel} tone={statusTone(result.digitalLevel)} />
            </div>
          </Chapter>

          <Chapter
            number="四"
            title="轉換漏斗與廣告效率"
            intro="CPA 用來看每成交一位客人的廣告成本；ROAS 用來看每 1 元廣告費帶回多少營收。若未填寫廣告成交數，CPA 將無法計算，但 ROAS 仍可依營收與廣告費估算。"
            className="pfm-ad-chapter"
          >
            <div className="pfm-metric-grid three">
              <MetricCard label="CPA" value={result.cpa} sub="每成交一位客人的廣告總成本" />
              <MetricCard label="ROAS" value={result.roas} sub="每 1 元廣告成本創造的營收倍數" />
              <MetricCard label="金流手續費率" value={result.paymentFeeRate} sub="非現金收款平台成本占營收比例" />
            </div>

            <div className={`pfm-ad-insight tone-${statusTone(roasLevel)}`}>
              <span>廣告效率評級</span>
              <strong>{roasLevel}</strong>
              <p>{roasInsight}</p>
            </div>
          </Chapter>

          <Chapter number="五" title="成長瓶頸與顧問診斷">
            <div className="pfm-narrative-grid">
              <div className="pfm-report-card">
                <h3>目前狀態</h3>
                <p>{display(result.currentStatus)}</p>
              </div>
              <div className="pfm-report-card">
                <h3>成長機會</h3>
                <p>{display(result.growthOpportunity)}</p>
              </div>
              <div className="pfm-report-card">
                <h3>建議方向</h3>
                <p>{display(result.suggestionDirection)}</p>
              </div>
            </div>
          </Chapter>

          <Chapter number="六" title="成長潛力雷達圖" intro="用五個面向快速看見目前店家的經營輪廓與下一步放大方向。">
            <div className="pfm-radar-layout">
              <RadarChart result={result} />
              <div className="pfm-report-card pfm-radar-summary">
                <h3>成長潛力評級</h3>
                <strong>{display(result.growthPotentialLevel)}</strong>
                <p>{display(result.growthOpportunity)}</p>
              </div>
            </div>
          </Chapter>

          <Chapter number="七" title="90天優先改善路徑">
            <StepCards items={actions} />

            <div className="pfm-final-consult no-print">
              <p>{display(result.nextAction)}</p>
              <a className="btn" href={BOOKING_URL || '#'} target="_blank" rel="noreferrer">
                {display(result.bookingText, 'Line｜預約 PFM 一對一診斷')}
              </a>
            </div>
          </Chapter>
        </section>
      )}

      <div className="result-actions-v12 no-print">
        <button className="btn secondary" onClick={onRestart}>
          重新健檢
        </button>
      </div>
    </main>
  );
}
