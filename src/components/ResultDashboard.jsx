import React, { useMemo, useState } from 'react';
import { executiveSummary, getProblemAdvice, getStrengthAdvice } from '../data/pfmKnowledge.js';

function safeNumber(value, fallback = 0) {
  const n = Number(String(value ?? '').replace(/[$,%\s,]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function fmtMoney(value) {
  const n = safeNumber(value);
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function fmtPercent(value) {
  const n = safeNumber(value);
  return `${n.toFixed(2)}%`;
}

function fmtNumber(value, digits = 2) {
  const n = safeNumber(value);
  return n.toFixed(digits);
}

function pick(...values) {
  return values.find((v) => v !== undefined && v !== null && String(v).trim() !== '') ?? '';
}

function cell(data, address) {
  if (!data || !address) return undefined;
  const key = String(address).toUpperCase();
  return pick(
    data?.raw?.[key],
    data?.cells?.[key],
    data?.dashboardData?.[key],
    data?.cell?.[key],
    data?.[key],
    data?.[`Dashboard_Data!${key}`]
  );
}

function rowValue(data, rowNumber) {
  const rows = data?.rows || data?.values || data?.dashboardRows;
  if (!Array.isArray(rows)) return undefined;
  const row = rows[rowNumber - 1];
  if (!Array.isArray(row)) return undefined;
  return row[1];
}

function kpiValue(data, label) {
  if (!data || !label) return undefined;
  const direct = pick(data[label], data?.kpi?.[label], data?.dashboard?.[label]);
  if (direct !== '') return direct;

  const rows = data?.rows || data?.values || data?.dashboardRows;
  if (Array.isArray(rows)) {
    const found = rows.find((row) => Array.isArray(row) && String(row[0] ?? '').trim() === label);
    if (found) return found[1];
  }

  return undefined;
}

function gradeByHigherBetter(value, excellent, good, caution) {
  const n = safeNumber(value);
  if (n >= excellent) return '優秀';
  if (n >= good) return '良好';
  if (n >= caution) return '注意';
  return '待改善';
}

function gradeByLowerBetter(value, excellent, good, caution) {
  const n = safeNumber(value);
  if (n <= excellent) return '優秀';
  if (n <= good) return '良好';
  if (n <= caution) return '注意';
  return '待改善';
}

function gradeClass(grade) {
  if (grade === '優秀') return 'is-excellent';
  if (grade === '良好' || grade === '穩定') return 'is-good';
  if (grade === '注意' || grade === '普通') return 'is-caution';
  return 'is-weak';
}

function ratingLabel(stars = '') {
  const count = String(stars || '').split('★').length - 1;
  if (count >= 5) return '極高';
  if (count >= 4) return '高';
  if (count >= 3) return '中';
  if (count >= 2) return '低';
  return '觀察';
}

function confidenceScore({ totalRevenue, grossMargin, netMargin, returningRate, referralRate, socialScore, contentScore, digitalScore, roas, cpa }) {
  const fields = [totalRevenue, grossMargin, netMargin, returningRate, referralRate, socialScore, contentScore, digitalScore, roas, cpa];
  const validCount = fields.filter((v) => Number.isFinite(Number(v)) && Number(v) !== 0).length;
  const base = 68 + Math.min(24, validCount * 3);
  return Math.max(72, Math.min(96, Math.round(base)));
}

function confidenceGrade(score) {
  const s = safeNumber(score);
  if (s >= 90) return '診斷可信度：高';
  if (s >= 82) return '診斷可信度：良好';
  if (s >= 74) return '診斷可信度：中等';
  return '診斷可信度：建議補充資料';
}

function capabilityGrade(score) {
  const s = safeNumber(score);
  if (s >= 80) return '優秀';
  if (s >= 65) return '良好';
  if (s >= 45) return '普通';
  return '需加強';
}

function capabilityClass(score) {
  const grade = capabilityGrade(score);
  if (grade === '優秀') return 'is-excellent';
  if (grade === '良好') return 'is-good';
  if (grade === '普通') return 'is-caution';
  return 'is-weak';
}

function capabilityMeta(key, score, context = {}) {
  const s = Math.round(Math.max(0, Math.min(100, safeNumber(score))));
  const data = {
    profit: {
      icon: '💰',
      title: '獲利能力',
      focus: ['毛利率', '淨利率', '成本結構', '固定費用'],
      advice: s < 45 ? '先讓每一筆營收真正留下來，再追求更大的營收規模。' : '獲利基礎已逐步形成，下一步可優化成本與高價值服務組合。',
    },
    customer: {
      icon: '👥',
      title: '客戶經營',
      focus: ['新客率', '回流率', '介紹客', '會員經營'],
      advice: s < 45 ? '先建立回訪提醒與顧客標籤，降低對新客流量的依賴。' : '客戶經營已有基礎，可進一步放大回流、會員與轉介紹機制。',
    },
    traffic: {
      icon: '📣',
      title: '流量能力',
      focus: ['社群經營', '內容執行', '自然曝光', '數位成熟'],
      advice: s < 45 ? '先建立穩定內容節奏，讓潛在顧客看懂服務價值。' : '內容與流量已有基礎，建議把高互動內容轉成預約入口。',
    },
    conversion: {
      icon: '🎯',
      title: '轉換能力',
      focus: ['CPA', 'ROAS', '成交承接', '金流成本'],
      advice: s < 45 ? '先檢查從詢問到預約的流失點，不要急著加大廣告。' : '轉換效率已有基礎，可持續優化素材、受眾與成交流程。',
    },
    brand: {
      icon: '💎',
      title: '品牌成熟',
      focus: ['預約流程', '顧客資料', '數位系統', '品牌節奏'],
      advice: s < 45 ? '先把預約、回訪與顧客資料管理流程固定下來。' : '品牌成熟度具備基礎，下一步可建立更穩定的系統化經營節奏。',
    },
  };
  const item = data[key] || data.profit;
  return { ...item, key, score: s, grade: capabilityGrade(s), className: capabilityClass(s) };
}

function CapabilityCard({ item, compact = false }) {
  return (
    <article className={`pfm-v22-capability-card ${item.className} ${compact ? 'is-compact' : ''}`.trim()}>
      <div className="pfm-v22-capability-head">
        <span>{item.icon}</span>
        <div>
          <h4>{item.title}</h4>
          <b>{item.grade}</b>
        </div>
        <strong>{item.score}<small>/100</small></strong>
      </div>
      <div className="pfm-v22-capability-bar"><i style={{ width: `${Math.max(4, Math.min(100, item.score))}%` }} /></div>
      <p className="pfm-v22-capability-focus"><em>評估重點：</em>{item.focus.join('、')}</p>
      <p className="pfm-v22-capability-advice">{item.advice}</p>
    </article>
  );
}

function IconBadge({ icon }) {
  return <span className="pfm-v17-icon-badge" aria-hidden="true">{icon}</span>;
}

function GradePill({ grade }) {
  if (!grade) return null;
  return <span className={`pfm-v17-grade-pill ${gradeClass(grade)}`}>{grade}</span>;
}

function ConsultantTip({ children }) {
  if (!children) return null;
  return (
    <div className="pfm-v17-tip">
      <span className="pfm-v17-tip-icon" aria-hidden="true">💡</span>
      <p>{children}</p>
    </div>
  );
}

function MetricCard({ icon, label, value, grade, desc, tip, className = '' }) {
  return (
    <article className={`pfm-v17-metric-card ${className}`.trim()}>
      <div className="pfm-v17-metric-head">
        <IconBadge icon={icon} />
        <div>
          <h4>{label}</h4>
          <GradePill grade={grade} />
        </div>
      </div>
      <div className="pfm-v17-metric-value">{value}</div>
      {desc && <p className="pfm-v17-metric-desc">{desc}</p>}
      <ConsultantTip>{tip}</ConsultantTip>
    </article>
  );
}

function Section({ chapter, icon, title, subtitle, children, className = '' }) {
  return (
    <section className={`pfm-v17-section ${className}`.trim()}>
      {(chapter || icon) && (
        <div className="pfm-v17-chapter-label">
          {icon && <IconBadge icon={icon} />}
          {chapter && <span>{chapter}</span>}
        </div>
      )}
      <h2>{title}</h2>
      {subtitle && <p className="pfm-v17-section-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

function InsightBox({ children }) {
  return (
    <div className="pfm-v17-insight-box">
      <h4>PFM 顧問解讀</h4>
      <p>{children}</p>
    </div>
  );
}


function stageSummary(score, stage = '') {
  const s = safeNumber(score);
  const stageText = String(stage || '');
  if (stageText.includes('擴張') || s >= 90) return '獲利體質已相對成熟，下一步可放大會員經營、團隊分工與流量規模。';
  if (stageText.includes('優化') || s >= 80) return '經營模式逐漸穩定，下一步建議優化回流、轉換效率與內容承接系統。';
  if (stageText.includes('建構') || s >= 70) return '目前已具備成長條件，可開始建立流量、會員與獲利管理系統。';
  if (s >= 60) return '經營模式尚未完全穩定，建議優先修復獲利結構、回流機制與成本控管。';
  return '目前營運風險偏高，建議先回到核心數據，優先處理獲利、成本與客戶回流問題。';
}

function overviewFindings({ profitGrade, netGrade, returnGrade, avgTicketGrade, feeGrade, grossMargin, netMargin, returningRate, avgTicket, paymentFeeRate }) {
  const findings = [];

  if (profitGrade === '優秀' && netGrade === '優秀') {
    findings.push(`毛利率 ${fmtPercent(grossMargin)}、淨利率 ${fmtPercent(netMargin)} 表現優秀，代表目前具備健康的獲利基礎。`);
  } else if (profitGrade === '待改善' || netGrade === '待改善') {
    findings.push('毛利率或淨利率仍有壓力，建議優先檢視定價、直接成本與固定費用。');
  } else {
    findings.push('獲利結構已有基礎，但仍需持續觀察毛利、淨利與成本之間的平衡。');
  }

  if (returnGrade === '優秀' || returnGrade === '良好') {
    findings.push(`回流率 ${fmtPercent(returningRate)} 已具備穩定顧客基礎，可進一步設計會員與再購機制。`);
  } else {
    findings.push(`回流率 ${fmtPercent(returningRate)} 仍有提升空間，建議建立固定回訪、會員標籤與再購提醒。`);
  }

  if (paymentFeeRate > 0) {
    findings.push(`金流手續費率 ${fmtPercent(paymentFeeRate)} 會直接影響實際留下來的淨利，建議同步檢視收款結構。`);
  }

  if (feeGrade === '待改善' || feeGrade === '注意') {
    findings.push(`金流手續費率 ${fmtPercent(paymentFeeRate)} 偏高，建議檢視支付工具、非現金收款比例與平台費率。`);
  }

  return findings;
}


function problemAdvice(problem, index = 0) {
  return getProblemAdvice(problem, index);
}

function problemConsultantText(problem, index) {
  return problemAdvice(problem, index).summary;
}

function strengthAdvice(strength, index = 0) {
  return getStrengthAdvice(strength, index);
}

function strengthConsultantText(strength, index) {
  return strengthAdvice(strength, index).summary;
}

function scoreByHigher(value, poor, caution, good, excellent) {
  const n = safeNumber(value);
  if (n >= excellent) return Math.min(100, 92 + (n - excellent) * 0.5);
  if (n >= good) return 75 + ((n - good) / (excellent - good)) * 17;
  if (n >= caution) return 50 + ((n - caution) / (good - caution)) * 25;
  if (n >= poor) return 25 + ((n - poor) / (caution - poor)) * 25;
  return Math.max(0, (n / Math.max(poor, 1)) * 25);
}

function scoreByLower(value, excellent, good, caution, weak) {
  const n = safeNumber(value);
  if (n <= excellent) return 95;
  if (n <= good) return 75 + ((good - n) / (good - excellent)) * 20;
  if (n <= caution) return 50 + ((caution - n) / (caution - good)) * 25;
  if (n <= weak) return 25 + ((weak - n) / (weak - caution)) * 25;
  return Math.max(0, 25 - (n - weak) / Math.max(weak, 1) * 20);
}

function scoreToStage(score) {
  const s = safeNumber(score);
  if (s >= 85) return '擴張期';
  if (s >= 70) return '優化期';
  if (s >= 55) return '建構期';
  if (s >= 40) return '修復期';
  return '重整期';
}

function scoreToSummary(score) {
  const s = safeNumber(score);
  if (s >= 85) return '獲利體質已相對成熟，下一步可放大會員經營、團隊分工與流量規模。';
  if (s >= 70) return '經營模式逐漸穩定，下一步建議優化回流、轉換效率與內容承接系統。';
  if (s >= 55) return '目前已具備成長條件，但仍需要建立更穩定的獲利、回流與顧客經營系統。';
  if (s >= 40) return '目前營運已有基礎，但獲利或回流結構仍需先修復，避免越成長越吃力。';
  return '目前營運風險偏高，建議先回到核心數據，優先處理獲利、成本與客戶回流問題。';
}

function scoreToGrade(score) {
  const s = safeNumber(score);
  if (s >= 85) return '優秀';
  if (s >= 70) return '良好';
  if (s >= 55) return '中等';
  if (s >= 40) return '待修復';
  return '高風險';
}

function RadarChart({ scores }) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 128;
  const labels = [
    { key: 'profit', text: '獲利能力' },
    { key: 'customer', text: '客戶經營' },
    { key: 'traffic', text: '流量能力' },
    { key: 'conversion', text: '轉換能力' },
    { key: 'brand', text: '品牌成熟' },
  ];

  const pointFor = (index, percent, extra = 0) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / labels.length;
    const r = radius * (percent / 100) + extra;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const polygon = labels
    .map((item, index) => pointFor(index, Math.max(0, Math.min(100, safeNumber(scores[item.key])))).join(','))
    .join(' ');

  return (
    <svg className="pfm-v17-radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="成長潛力雷達圖">
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon
          key={pct}
          points={labels.map((_, index) => pointFor(index, pct).join(',')).join(' ')}
          className="pfm-v17-radar-grid"
        />
      ))}
      {labels.map((_, index) => {
        const [x, y] = pointFor(index, 100);
        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} className="pfm-v17-radar-axis" />;
      })}
      <polygon points={polygon} className="pfm-v17-radar-area" />
      <polyline points={`${polygon} ${polygon.split(' ')[0]}`} className="pfm-v17-radar-line" />
      {labels.map((item, index) => {
        const value = Math.round(Math.max(0, Math.min(100, safeNumber(scores[item.key]))));
        const [x, y] = pointFor(index, 100, 48);
        return (
          <text key={item.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="pfm-v17-radar-label">
            <tspan x={x} dy="-0.35em">{item.text}</tspan>
            <tspan x={x} dy="1.35em" className="pfm-v17-radar-score">{value}分</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export default function ResultDashboard({ result = {}, formData = {}, onRestart }) {
  const [isBlueprintUnlocked, setIsBlueprintUnlocked] = useState(false);
  const data = result || {};
  const storeName = pick(data.storeName, formData.storeName, formData.contactName, '你的店');
  const storeType = pick(data.storeType, formData.storeType, data.businessType, formData.businessType, '美業店家');
  const category = pick(data.category, data.businessCategory, formData.businessCategory, formData.storeCategory, '美業');
  const month = pick(data.month, formData.month, '');

  const totalRevenue = safeNumber(pick(data.totalRevenue, data.revenue, data.monthlyRevenue, data.serviceRevenue, formData.serviceRevenue));
  const grossMargin = safeNumber(pick(data.grossMarginRate, data.grossMargin, data['毛利率']));
  const netMargin = safeNumber(pick(data.netMarginRate, data.netMargin, data['淨利率']));
  const returningRate = safeNumber(pick(data.returningRate, data.returnRate, data['回流率']));
  const avgTicket = safeNumber(pick(data.averageTicket, data.avgTicket, data.customerUnitPrice, data['客單價']));
  const paymentFeeRate = safeNumber(pick(data.paymentFeeRate, data.cashFlowFeeRate, data['金流手續費率']));
  const laborRate = safeNumber(pick(data.laborCostRate, data.staffCostRate, data['人事成本率']));
  const rentRate = safeNumber(pick(data.rentRate, data['租金率']));
  const adRate = safeNumber(pick(data.adRate, data.marketingRate, data['廣告率']));
  const cpa = safeNumber(pick(data.cpa, data.CPA));
  const roas = safeNumber(pick(data.roas, data.ROAS));
  const newCustomerRate = safeNumber(pick(data.newCustomerRate, data.newRate, data['新客率']));
  const referralRate = safeNumber(pick(data.referralRate, data.introductionRate, data['介紹客比例']));
  const customerPower = safeNumber(pick(data.customerPower, data.customerManagementPower, data.customerOperationPower, data.clientManagementPower, kpiValue(data, '客戶經營力'), cell(data, 'B20'), rowValue(data, 20))); // Dashboard_Data!B20
  const socialScore = safeNumber(pick(data.socialScore, data.socialManagementScore, data['社群經營度']));
  const contentScore = safeNumber(pick(data.contentScore, data.contentExecutionScore, data['內容執行力']));
  const digitalScore = safeNumber(pick(data.digitalScore, data.digitalMaturityScore, data['數位成熟度']));
  const digitalGrade = pick(data.digitalGrade, data.digitalMaturityGrade, data['數位成熟度評級'], gradeByHigherBetter(digitalScore, 70, 50, 30));

  const sheetProfitAbilityScore = safeNumber(pick(data.profitAbilityScore, kpiValue(data, '獲利能力分數'), cell(data, 'B46'), rowValue(data, 46)));
  const sheetCustomerMaturityScore = safeNumber(pick(data.customerMaturityScore, kpiValue(data, '客戶經營成熟度分數'), cell(data, 'B47'), rowValue(data, 47)));
  const sheetTrafficContentScore = safeNumber(pick(data.trafficContentScore, kpiValue(data, '流量內容成熟度分數'), cell(data, 'B48'), rowValue(data, 48)));
  const sheetAdConversionScore = safeNumber(pick(data.adConversionScore, kpiValue(data, '廣告轉換效率分數'), cell(data, 'B49'), rowValue(data, 49)));
  const sheetNewGrowthStage = pick(data.newGrowthStage, kpiValue(data, '新版成長階段'), cell(data, 'B51'), rowValue(data, 51), data['新版成長階段']);

  const sheetOverallScore = safeNumber(pick(data.newOverallScore, kpiValue(data, '新版綜合分數'), cell(data, 'B50'), rowValue(data, 50), data.overallScore, data.growthStageScore, data['新版綜合分數'], data['成長階段綜合分數'])); // Dashboard_Data!B50 first

  const problem1 = pick(data.problem1, data['問題1'], '回流率偏低');
  const problem2 = pick(data.problem2, data['問題2'], '客戶經營力不足');
  const problem3 = pick(data.problem3, data['問題3'], '目前無明顯問題');
  const strength1 = pick(data.strength1, data['優勢1'], '淨利率表現優秀');
  const strength2 = pick(data.strength2, data['優勢2'], '毛利率表現優秀');
  const strength3 = pick(data.strength3, data['優勢3'], '介紹客來源穩定');
  const firstPriority = pick(data.firstPriority, data['第一優先'], '建立回流機制');
  const hiddenCostText = pick(data.hiddenCostReminder, data['隱形成本提醒'], `本月非現金收款約 ${fmtMoney(totalRevenue)}，產生金流手續費 ${fmtMoney(totalRevenue * paymentFeeRate / 100)}（${fmtPercent(paymentFeeRate)}），若維持目前規模，一年約流失 ${fmtMoney(totalRevenue * paymentFeeRate / 100 * 12)} 的利潤，建議同步檢視金流結構與收款模式。`);
  const consultantStatus = pick(data.currentStatus, data['目前狀態'], `目前主要卡點在「${problem1}」，其次是「${problem2}」。`);
  const consultantOpportunity = pick(data.growthOpportunity, data['成長機會'], `目前最大優勢為「${strength1}」，可作為下一階段成長槓桿。`);
  const consultantDirection = pick(data.suggestionDirection, data['建議方向'], `建議優先針對「${problem1}」建立改善策略，並從「${firstPriority}」開始執行。`);

  const profitGrade = gradeByHigherBetter(grossMargin, 80, 70, 60);
  const netGrade = gradeByHigherBetter(netMargin, 30, 20, 10);
  const returnGrade = gradeByHigherBetter(returningRate, 40, 25, 15);
  const avgTicketGrade = gradeByHigherBetter(avgTicket, 4000, 2500, 1500);
  const feeGrade = gradeByLowerBetter(paymentFeeRate, 1.5, 3, 5);
  const laborGrade = gradeByLowerBetter(laborRate, 25, 35, 45);
  const rentGrade = gradeByLowerBetter(rentRate, 10, 15, 20);
  const adGrade = gradeByLowerBetter(adRate, 8, 12, 18);
  const customerPowerGrade = customerPower >= 8 ? '優秀' : customerPower >= 6 ? '穩定' : customerPower >= 4 ? '注意' : '薄弱';
  const roasGrade = roas >= 8 ? '優秀' : roas >= 5 ? '良好' : roas >= 3 ? '注意' : '偏低';

  const metricScores = useMemo(() => {
    const grossScore = scoreByHigher(grossMargin, 40, 60, 70, 80);
    const netScore = scoreByHigher(netMargin, -5, 5, 15, 25);
    const feeScore = scoreByLower(paymentFeeRate, 1.5, 3, 5, 8);
    const returnScore = scoreByHigher(returningRate, 5, 15, 25, 40);
    const referralScore = scoreByHigher(referralRate, 5, 15, 25, 40);
    const customerPowerScore = Math.max(0, Math.min(100, customerPower * 10));
    const trafficScore = Math.round((socialScore + contentScore + digitalScore) / 3);
    const roasScore = scoreByHigher(roas, 1, 3, 5, 8);
    const cpaScore = cpa > 0 ? scoreByLower(cpa, 800, 1600, 2800, 4200) : 30;
    const profit = Math.round(grossScore * 0.45 + netScore * 0.45 + feeScore * 0.10);
    const customer = Math.round(returnScore * 0.45 + referralScore * 0.25 + customerPowerScore * 0.30);
    const conversion = Math.round(roasScore * 0.45 + cpaScore * 0.35 + feeScore * 0.20);
    const brand = Math.round(digitalScore || trafficScore || 0);
    const overall = Math.round(profit * 0.40 + customer * 0.25 + trafficScore * 0.15 + conversion * 0.10 + brand * 0.10);
    return { profit, customer, traffic: trafficScore, conversion, brand, overall };
  }, [grossMargin, netMargin, paymentFeeRate, returningRate, referralRate, customerPower, socialScore, contentScore, digitalScore, roas, cpa]);

  const overallScore = sheetOverallScore || metricScores.overall;
  const growthStage = sheetNewGrowthStage || scoreToStage(overallScore);
  const heroSummary = scoreToSummary(overallScore);
  const execSummary = executiveSummary({ stage: growthStage, score: overallScore, problem1, strength1, firstPriority });
  const diagnosisConfidence = confidenceScore({ totalRevenue, grossMargin, netMargin, returningRate, referralRate, socialScore, contentScore, digitalScore, roas, cpa });
  const overviewInsightList = overviewFindings({
    profitGrade,
    netGrade,
    returnGrade,
    avgTicketGrade,
    feeGrade,
    grossMargin,
    netMargin,
    returningRate,
    avgTicket,
    paymentFeeRate,
  });

  const handleUnlockBlueprint = (event) => {
    event.preventDefault();
    setIsBlueprintUnlocked(true);
    setTimeout(() => {
      document.getElementById('pfm-blueprint-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleExportPdf = () => {
    setIsBlueprintUnlocked(true);
    setTimeout(() => {
      document.body.classList.add('pfm-v21-print-mode');
      window.print();
      setTimeout(() => document.body.classList.remove('pfm-v21-print-mode'), 400);
    }, 120);
  };

  const radarScores = useMemo(() => ({
    profit: sheetProfitAbilityScore || metricScores.profit,
    customer: sheetCustomerMaturityScore || metricScores.customer,
    traffic: sheetTrafficContentScore || metricScores.traffic,
    conversion: sheetAdConversionScore || metricScores.conversion,
    brand: digitalScore || metricScores.brand,
  }), [sheetProfitAbilityScore, sheetCustomerMaturityScore, sheetTrafficContentScore, sheetAdConversionScore, metricScores, digitalScore]);

  const capabilityItems = useMemo(() => ([
    capabilityMeta('profit', radarScores.profit),
    capabilityMeta('customer', radarScores.customer),
    capabilityMeta('traffic', radarScores.traffic),
    capabilityMeta('conversion', radarScores.conversion),
    capabilityMeta('brand', radarScores.brand),
  ]), [radarScores]);

  return (
    <main className="pfm-v17-result-page">
      <section className="pfm-v17-hero-card">
        <div className="pfm-v17-hero-copy">
          <p className="pfm-v17-eyebrow">PFM 美業獲利健檢結果</p>
          <h1>{storeName}｜經營診斷結果</h1>
          <p>{heroSummary}</p>
          <div className="pfm-v17-tags">
            <span>{storeType}</span>
            <span>{category}</span>
            {month && <span>{month}</span>}
          </div>
        </div>
        <div className="pfm-v17-stage-card">
          <p>店家成長階段</p>
          <strong>{growthStage}</strong>
          <div className="pfm-v17-score-circle">{fmtNumber(overallScore, 2)}</div>
          <span>綜合分數</span>
        </div>
      </section>

      <section className="pfm-v21-consultant-summary" aria-label="PFM 顧問摘要">
        <div>
          <span>目前階段</span>
          <strong>{growthStage}</strong>
          <p>{heroSummary}</p>
        </div>
        <div>
          <span>最大風險</span>
          <strong>{problem1}</strong>
          <p>{problemConsultantText(problem1, 0)}</p>
        </div>
        <div>
          <span>最大優勢</span>
          <strong>{strength1}</strong>
          <p>{strengthConsultantText(strength1, 0)}</p>
        </div>
        <div>
          <span>90天優先</span>
          <strong>{firstPriority}</strong>
          <p>先聚焦一個最能影響獲利與回流的改善動作，避免一次處理太多方向。</p>
        </div>
      </section>

      <Section title="獲利健康度總覽" subtitle="先看最直接影響獲利與經營穩定度的核心指標。" className="pfm-v17-overview-section">
        <div className="pfm-v18-overview-core-row">
          <MetricCard icon="💰" label="毛利率" value={fmtPercent(grossMargin)} grade={profitGrade} desc="服務定價與成本控制。" tip="毛利率維持在健康區間，代表目前服務定價與直接成本控制有基礎。" />
          <MetricCard icon="📈" label="淨利率" value={fmtPercent(netMargin)} grade={netGrade} desc="真正留下的獲利能力。" tip="淨利率是能否持續成長的核心，數值越穩定代表經營體質越健康。" />
          <MetricCard icon="🔁" label="回流率" value={fmtPercent(returningRate)} grade={returnGrade} desc="顧客再次消費比例。" tip="回流率是美業獲利關鍵，建議持續建立固定回訪與會員機制。" />
        </div>

        <div className="pfm-v18-overview-support-row">
          <MetricCard icon="🏢" label="租金率" value={fmtPercent(rentRate)} grade={rentGrade} desc="店面固定成本占營收比例。" tip="租金率反映空間成本與營收規模是否匹配，建議搭配坪效與預約率一起檢視。" />
          <MetricCard icon="🏦" label="金流手續費率" value={fmtPercent(paymentFeeRate)} grade={feeGrade} desc="非現金收款平台成本占營收比例。" tip="金流費用不一定會被第一時間感覺到，但會直接影響實際留下來的淨利。" />
        </div>
        <div className="pfm-v18-overview-findings">
          <h4>PFM 顧問解讀</h4>
          <ul>
            {overviewInsightList.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </Section>

      <section className="pfm-v17-two-col">
        <div className="pfm-v17-list-card is-problem">
          <span className="pfm-v17-status-dot" />
          <h2>目前最需要處理的三件事</h2>
          <p>優先看會影響獲利、回流與成長速度的關鍵問題。</p>
          {[problem1, problem2, problem3].map((item, index) => {
            const advice = problemAdvice(item, index);
            return (
              <div className="pfm-v17-list-item pfm-v21-advice-item" key={`${item}-${index}`}>
                <b>{index + 1}</b>
                <div>
                  <span className="pfm-v22-advice-category is-problem">{['❶','❷','❸'][index] || `${index + 1}`} {advice.category || '經營風險'}</span>
                  <strong>{advice.title || item}</strong>
                  <p>{advice.summary}</p>
                  <div className="pfm-v22-rating-row is-problem"><span>影響程度：</span><b>{advice.severity}</b><em>{ratingLabel(advice.severity)}</em></div>
                  <div className="pfm-v22-analysis-row is-problem"><strong>⚠ 風險：</strong><span>{advice.risk}</span></div>
                  <div className="pfm-v22-analysis-row is-action"><strong>✓ 第一步：</strong><span>{advice.action}</span></div>
                  <div className="pfm-v22-consultant-note is-problem"><strong>PFM 顧問提醒</strong><p>{advice.quote}</p></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pfm-v17-list-card is-strength">
          <span className="pfm-v17-status-dot" />
          <h2>目前最值得放大的三個優勢</h2>
          <p>不是只找問題，也要看見你已經做對的地方。</p>
          {[strength1, strength2, strength3].map((item, index) => {
            const advice = strengthAdvice(item, index);
            return (
              <div className="pfm-v17-list-item pfm-v21-advice-item" key={`${item}-${index}`}>
                <b>{index + 1}</b>
                <div>
                  <span className="pfm-v22-advice-category is-strength">{['❶','❷','❸'][index] || `${index + 1}`} {advice.category || '優勢放大'}</span>
                  <strong>{advice.title || item}</strong>
                  <p>{advice.summary}</p>
                  <div className="pfm-v22-rating-row is-strength"><span>放大潛力：</span><b>{advice.potential}</b><em>{ratingLabel(advice.potential)}</em></div>
                  <div className="pfm-v22-analysis-row is-strength"><strong>↗ 放大方向：</strong><span>{advice.leverage}</span></div>
                  <div className="pfm-v22-analysis-row is-action"><strong>✓ 第一步：</strong><span>{advice.action}</span></div>
                  <div className="pfm-v22-consultant-note is-strength"><strong>PFM 顧問提醒</strong><p>{advice.quote}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pfm-v17-hidden-cost">
        <div>
          <p className="pfm-v17-eyebrow">⚠ 隱形成本提醒</p>
          <h2>金流手續費正在持續吃掉你的淨利</h2>
          <p>{hiddenCostText}</p>
        </div>
        <div className="pfm-v17-hidden-number">
          <span>本期金流手續費率</span>
          <strong>{fmtPercent(paymentFeeRate)}</strong>
          <p>若維持目前規模，這類費用會持續累積成年度獲利流失。</p>
        </div>
      </section>

      <section className="pfm-v18-unlock-card" id="pfm-blueprint-unlock">
        <p className="pfm-v17-eyebrow">免費解鎖</p>
        <h2>店家成長藍圖已產生</h2>
        <p>看懂結果只是開始。點擊下方按鈕後，可直接查看你的獲利結構、客戶經營、流量內容能力、成長瓶頸與 90 天顧問建議。</p>
        <div className="pfm-v18-unlock-points" aria-label="解鎖內容">
          <span>獲利結構分析</span>
          <span>客戶經營分析</span>
          <span>流量內容能力</span>
          <span>廣告效率評估</span>
          <span>成長潛力藍圖</span>
          <span>90天改善路徑</span>
        </div>
        {!isBlueprintUnlocked ? (
          <form className="pfm-v18-unlock-form is-button-only" onSubmit={handleUnlockBlueprint}>
            <button type="submit">免費解鎖完整報告</button>
          </form>
        ) : (
          <div className="pfm-v18-unlocked-note">已解鎖完整成長藍圖，請往下查看完整章節。</div>
        )}
        {onRestart && <button className="pfm-v18-restart-link" type="button" onClick={onRestart}>重新健檢</button>}
      </section>

      {isBlueprintUnlocked && (
        <>
      <section className="pfm-v17-blueprint-nav" id="pfm-blueprint-start">
        <p className="pfm-v17-eyebrow">店家成長藍圖</p>
        <h2>從「知道問題」進入「理解原因」</h2>
        <p>以下內容將目前健檢數據整理成顧問視角，協助你看見獲利、客戶、流量與下一步改善方向。</p>
        <div>
          <span>💰 獲利結構</span><span>👥 客戶經營</span><span>📣 流量內容</span><span>🎯 廣告效率</span><span>⭐ 成長潛力</span><span>🚀 90天改善</span>
        </div>
      </section>

      <Section chapter="第一章" icon="💰" title="獲利結構分析" subtitle="獲利不是只看營收，而是看毛利、淨利與成本是否能留下錢。" className="pfm-v17-profit-section">
        <div className="pfm-v17-profit-top">
          <MetricCard className="is-revenue" icon="💵" label="本月營收" value={fmtMoney(totalRevenue)} desc="本月整體營收規模。" tip="營收代表規模，但需要搭配毛利與淨利判斷是否真的有留下錢。" />
          <MetricCard icon="📈" label="毛利率" value={fmtPercent(grossMargin)} grade={profitGrade} desc="服務定價與成本控制。" tip="毛利率維持在80%以上，顯示定價策略與成本控管具備健康基礎。" />
          <MetricCard icon="💎" label="淨利率" value={fmtPercent(netMargin)} grade={netGrade} desc="真正留下的獲利能力。" tip="淨利率表現穩定，代表營運模式能有效轉化為淨利。" />
        </div>
        <div className="pfm-v17-profit-bottom">
          <MetricCard icon="👤" label="人事成本率" value={fmtPercent(laborRate)} grade={laborGrade} desc="人力成本控制狀況。" tip="人事成本控制得宜，建議可持續投資人才以支持業務成長。" />
          <MetricCard icon="🏢" label="租金率" value={fmtPercent(rentRate)} grade={rentGrade} desc="租金與營收匹配度。" tip="租金占比在合理範圍內，持續維持現況有助於獲利穩定。" />
          <MetricCard icon="📣" label="廣告率" value={fmtPercent(adRate)} grade={adGrade} desc="行銷投資占營收比例。" tip="廣告投資占比偏高時，建議優化廣告策略以提升投資報酬率（ROAS）。" />
          <MetricCard icon="💳" label="金流手續費率" value={fmtPercent(paymentFeeRate)} grade={feeGrade} desc="支付與收款成本。" tip="金流費用占比偏高，可評估更優惠的金流方案以降低成本。" />
        </div>
        <div className="pfm-v17-standard-box">
          <h4>評級基準說明</h4>
          <p>評級標準參考美業常見經營模型、成本結構與 PFM 顧問診斷基準，用於協助店家快速理解目前數據所代表的經營狀態。</p>
        </div>
        <InsightBox>毛利率與淨利率是獲利能力的核心觀察點；若金流、廣告或固定成本偏高，即使營收不差，也可能讓實際留下來的錢被稀釋。</InsightBox>
      </Section>

      <Section chapter="第二章" icon="👥" title="客戶經營分析" subtitle="回流、新客與介紹客的比例，會決定你是靠穩定經營，還是一直追新客。">
        <div className="pfm-v17-metric-grid four">
          <MetricCard icon="👤" label="新客率" value={fmtPercent(newCustomerRate)} desc="新客開發能力。" tip="新客率代表開發能力，但若過高且回流偏低，可能表示經營仍依賴不斷找新客。" />
          <MetricCard icon="🔁" label="回流率" value={fmtPercent(returningRate)} grade={returnGrade} desc="顧客再次消費比例。" tip="回流率是美業穩定獲利的關鍵，建議建立固定回訪提醒與會員標籤。" />
          <MetricCard icon="🤝" label="介紹客比例" value={fmtPercent(referralRate)} desc="信任與口碑來源。" tip="介紹客代表信任與口碑，若比例穩定，可放大成轉介紹機制。" />
          <MetricCard icon="🏆" label="客戶經營力" value={`${fmtNumber(customerPower, 2)} / 10`} grade={customerPowerGrade} desc="顧客經營成熟程度。" tip="客戶經營力會影響回購、轉介紹與長期營收穩定度。" />
        </div>
        <InsightBox>客戶經營的重點不只是新客，而是讓顧客願意再次回來、願意介紹，進一步降低獲客壓力與廣告依賴。</InsightBox>
      </Section>

      <Section chapter="第三章" icon="📣" title="流量與內容能力" subtitle="PFM 不鼓勵盲目投廣告，而是先看目前是否具備自然流量與內容經營基礎。">
        <div className="pfm-v17-metric-grid four">
          <MetricCard icon="📱" label="社群經營度" value={fmtNumber(socialScore, 2)} desc="自然曝光與社群基礎。" tip="社群經營度反映自然曝光基礎，穩定內容能降低未來獲客成本。" />
          <MetricCard icon="✍️" label="內容執行力" value={fmtNumber(contentScore, 2)} desc="內容持續產出能力。" tip="內容執行力代表能否持續讓潛在顧客理解服務價值。" />
          <MetricCard icon="🌐" label="數位成熟度" value={fmtNumber(digitalScore, 2)} desc="數位化管理程度。" tip="數位成熟度會影響預約流程、顧客管理與後續放大效率。" />
          <MetricCard icon="📊" label="數位成熟度評級" value={digitalGrade} desc="數位經營整體評估。" tip="若評級偏弱，建議先建立固定內容節奏與基本顧客資料管理。" />
        </div>
        <InsightBox>流量與內容能力會影響未來獲客穩定度。若數位成熟度偏弱，建議先建立固定內容節奏，再進一步放大廣告投放。</InsightBox>
      </Section>

      <Section chapter="第四章" icon="🎯" title="轉換漏斗與廣告效率" subtitle="流量進來後，有沒有成功變成客戶？CPA 用來看每成交一位客人的廣告成本；ROAS 用來看每 1 元廣告費帶回多少營收。">
        <div className="pfm-v17-funnel-flow">
          <strong>轉換路徑</strong><span>曝光</span><em>→</em><span>詢問</span><em>→</em><span>預約</span><em>→</em><span>成交</span>
          <p>目前以 CPA、ROAS 與金流手續費率作為轉換效率的主要代理指標。</p>
        </div>
        <div className="pfm-v17-metric-grid three">
          <MetricCard icon="👤" label="CPA" value={cpa > 0 ? Math.round(cpa).toLocaleString('en-US') : '尚無成交資料'} desc="取得一位成交客成本。" tip="CPA 可判斷取得一位客人的成本是否過高，需搭配客單價與回流率一起評估。" />
          <MetricCard icon="📈" label="ROAS" value={roas > 0 ? fmtNumber(roas, 2) : '未投放廣告'} desc="每1元廣告帶回營收。" tip="ROAS 代表廣告投資回收效率，若偏低應優先檢查素材、受眾與成交流程。" />
          <MetricCard icon="💳" label="金流手續費率" value={fmtPercent(paymentFeeRate)} desc="非現金收款平台成本占營收比例。" tip="金流手續費是容易被忽略的隱形成本，需納入淨利率判斷。" />
        </div>
        <div className="pfm-v17-ad-grade">
          <h4>廣告效率評級</h4>
          <strong>{roasGrade}</strong>
          <p>{roas >= 8 ? '每投入 1 元廣告費，可創造良好營收。建議持續優化素材與受眾，同時強化會員經營與回流機制。' : '廣告效率仍有提升空間，建議優先檢查廣告素材、受眾設定與成交流程。'}</p>
        </div>
        <InsightBox>廣告效率不是只看有沒有投放，而是看流量進來後能否被預約、成交與回流承接。</InsightBox>
      </Section>

      <Section chapter="第五章" icon="⭐" title="成長潛力藍圖" subtitle="用五個面向快速看見目前店家的經營輪廓與下一步放大方向。">
        <div className="pfm-v22-radar-dashboard">
          <div className="pfm-v17-radar-card"><RadarChart scores={radarScores} /></div>
          <div className="pfm-v22-capability-panel">
            <div className="pfm-v22-radar-summary">
              <span>綜合評級</span>
              <strong>{scoreToGrade(overallScore)}</strong>
              <p>雷達圖用來快速看見目前五大能力的優勢與短板，能力卡提供每項能力的評估重點與改善方向，協助你掌握下一步優先改善順序。</p>
            </div>
            <div className="pfm-v22-capability-grid">
              {capabilityItems.map((item) => <CapabilityCard key={item.key} item={item} />)}
            </div>
          </div>
        </div>
      </Section>

      <Section chapter="第六章" icon="🚀" title="90天優先改善路徑" subtitle="將目前診斷結果轉換成可執行的三步驟，避免只知道問題，卻不知道下一步要做什麼。">
        <div className="pfm-v17-roadmap">
          <article><b>1</b><div><span>STEP 1</span><h4>{firstPriority}</h4><p>讓回流率往 35% 以上提升。</p></div></article>
          <article><b>2</b><div><span>STEP 2</span><h4>優化金流與廣告成本</h4><p>降低隱形成本，提升每一筆成交留下來的淨利。</p></div></article>
          <article><b>3</b><div><span>STEP 3</span><h4>建立會員經營系統</h4><p>用標籤、回訪與再購流程提升客戶終身價值。</p></div></article>
        </div>
      </Section>

      <div className="pfm-v18-pdf-actions">
        <button type="button" onClick={handleExportPdf}>列印 / 另存 PDF 報告</button>
      </div>

      <Section chapter="第七章" icon="🧭" title="顧問診斷結論">
        <div className="pfm-v17-consultant-grid">
          <article><h4>目前狀態</h4><p>{consultantStatus}</p></article>
          <article><h4>最大機會</h4><p>{consultantOpportunity}</p></article>
          <article><h4>建議方向</h4><p>{consultantDirection}</p></article>
        </div>
        <div className="pfm-v17-final-cta">
          <h2>問題已經找到，下一步是把數據轉成真正的獲利。</h2>
          <p>{consultantDirection}</p>
          <a href="https://line.me/" target="_blank" rel="noreferrer">Line｜預約 PFM 一對一診斷</a>
        </div>
      </Section>

      <section className="pfm-v22-confidence-card" aria-label="PFM 商業診斷可信度">
        <div>
          <span>PFM 商業診斷可信度</span>
          <strong>{confidenceGrade(diagnosisConfidence)}</strong>
          <p>本次診斷依據店家提供的經營資料，結合財務結構、成本結構、客戶經營、流量內容與轉換效率等多項指標交叉分析，作為本報告的診斷依據。</p>
        </div>
        <div className="pfm-v22-confidence-meter"><i style={{ width: `${diagnosisConfidence}%` }} /></div>
      </section>
        </>
      )}

      <section className="pfm-v21-pdf-report" aria-hidden="true">
        <article className="pfm-v21-pdf-page is-cover">
          <div className="pfm-v22-pdf-cover-mark">PFM</div>
          <p className="pfm-v21-pdf-brand">PFM｜Profit Flow Management</p>
          <p className="pfm-v22-pdf-cover-kicker">Premium Consulting Report</p>
          <h1>美業獲利健檢<br />專屬經營診斷報告</h1>
          <div className="pfm-v22-pdf-cover-line" />
          <div className="pfm-v21-pdf-cover-box">
            <p><span>店家名稱</span><strong>{storeName}</strong></p>
            <p><span>店家類型</span><strong>{storeType}｜{category}</strong></p>
            <p><span>報告日期</span><strong>{new Date().toLocaleDateString('zh-TW')}</strong></p>
          </div>
          <footer>PFM Profit Flow Management</footer>
        </article>


        <article className="pfm-v21-pdf-page is-exec">
          <header><span>01</span><h2>Executive Summary</h2></header>
          <section className="pfm-v22-exec-hero">
            <small>PFM 顧問一句話</small>
            <h3>{execSummary.headline}</h3>
            <p>{execSummary.next}</p>
          </section>
          <div className="pfm-v21-pdf-grid two">
            <div><small>目前階段</small><strong>{growthStage}</strong></div>
            <div><small>綜合分數</small><strong>{fmtNumber(overallScore, 2)}</strong></div>
            <div><small>最大風險</small><strong>{problemAdvice(problem1, 0).title}</strong></div>
            <div><small>最大優勢</small><strong>{strengthAdvice(strength1, 0).title}</strong></div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>接下來 90 天</h3><p><strong>應該聚焦：</strong>{execSummary.focus}</p><p><strong>暫時避免：</strong>{execSummary.avoid}</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page is-overview">
          <header><span>02</span><h2>經營診斷總覽</h2></header>
          <section className="pfm-v22-pdf-diagnosis-card">
            <small>目前狀態</small>
            <h3>{consultantStatus}</h3>
            <p>{heroSummary}</p>
          </section>
          <div className="pfm-v21-pdf-grid three">
            <div><small>最大風險</small><strong>{problemAdvice(problem1, 0).title}</strong></div>
            <div><small>最大機會</small><strong>{strengthAdvice(strength1, 0).title}</strong></div>
            <div><small>90天優先</small><strong>{firstPriority}</strong></div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>顧問判斷</h3><p>{consultantDirection}</p><p>建議先把改善焦點收斂在一個會直接影響獲利或回流的動作，避免同時追太多方向。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>03</span><h2>獲利健康總覽</h2></header>
          <div className="pfm-v21-pdf-grid four">
            <div><small>毛利率</small><strong>{fmtPercent(grossMargin)}</strong></div>
            <div><small>淨利率</small><strong>{fmtPercent(netMargin)}</strong></div>
            <div><small>回流率</small><strong>{fmtPercent(returningRate)}</strong></div>
            <div><small>金流手續費率</small><strong>{fmtPercent(paymentFeeRate)}</strong></div>
          </div>
          <div className="pfm-v22-pdf-bars">
            <div><span>獲利能力分數</span><i><em style={{ width: `${Math.max(8, Math.min(100, radarScores.profit))}%` }} /></i><strong>{fmtNumber(radarScores.profit, 0)}</strong></div>
            <div><span>淨利健康度</span><i><em style={{ width: `${Math.max(8, Math.min(100, scoreByHigher(netMargin, -5, 5, 15, 25)))}%` }} /></i><strong>{fmtNumber(scoreByHigher(netMargin, -5, 5, 15, 25), 0)}</strong></div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>PFM 顧問解讀</h3><ul>{overviewInsightList.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>04</span><h2>客戶經營分析</h2></header>
          <div className="pfm-v21-pdf-grid four">
            <div><small>新客率</small><strong>{fmtPercent(newCustomerRate)}</strong></div>
            <div><small>回流率</small><strong>{fmtPercent(returningRate)}</strong></div>
            <div><small>介紹客比例</small><strong>{fmtPercent(referralRate)}</strong></div>
            <div><small>客戶經營力</small><strong>{fmtNumber(customerPower, 2)} / 10</strong></div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>PFM 顧問解讀</h3><p>客戶經營的重點不是只有新客，而是顧客是否願意再次回來、願意介紹，並能被系統化經營。</p><p>若回流率偏低，建議優先建立回訪提醒、會員標籤與固定再購流程。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>05</span><h2>流量內容能力</h2></header>
          <div className="pfm-v21-pdf-grid four">
            <div><small>社群經營度</small><strong>{fmtNumber(socialScore, 2)}</strong></div>
            <div><small>內容執行力</small><strong>{fmtNumber(contentScore, 2)}</strong></div>
            <div><small>數位成熟度</small><strong>{fmtNumber(digitalScore, 2)}</strong></div>
            <div><small>數位成熟評級</small><strong>{digitalGrade}</strong></div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>PFM 顧問解讀</h3><p>流量與內容能力會影響未來獲客穩定度。若數位成熟度偏弱，建議先建立固定內容節奏，再進一步放大廣告投放。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>06</span><h2>轉換漏斗與廣告效率</h2></header>
          <div className="pfm-v21-pdf-grid three">
            <div><small>CPA</small><strong>{fmtNumber(cpa, 0)}</strong></div>
            <div><small>ROAS</small><strong>{fmtNumber(roas, 2)}</strong></div>
            <div><small>金流手續費率</small><strong>{fmtPercent(paymentFeeRate)}</strong></div>
          </div>
          <div className="pfm-v22-pdf-funnel"><span>曝光</span><b>→</b><span>詢問</span><b>→</b><span>預約</span><b>→</b><span>成交</span><b>→</b><span>回流</span></div>
          <section className="pfm-v21-pdf-insight"><h3>PFM 顧問解讀</h3><p>廣告效率不是只看有沒有投放，而是看流量進來後能否被預約、成交與回流承接。</p><p>若 ROAS 表現好但淨利偏低，仍要同步檢查成本結構與金流費用。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>07</span><h2>三大問題診斷</h2></header>
          <div className="pfm-v21-pdf-list">
            {[problem1, problem2, problem3].map((item, index) => { const advice = problemAdvice(item, index); return <section key={`${item}-pdf-${index}`}><b>{index + 1}</b><div><small className="pfm-v22-pdf-category is-problem">{advice.category || '經營風險'}</small><h3>{advice.title || item}</h3><p>{advice.summary}</p><p className="pfm-v22-pdf-meta is-problem"><strong>影響程度：</strong>{advice.severity}　{ratingLabel(advice.severity)}</p><p><strong>風險：</strong>{advice.risk}</p><p><strong>第一步：</strong>{advice.action}</p><p className="pfm-v22-pdf-quote is-problem"><strong>PFM 顧問提醒：</strong>{advice.quote}</p></div></section>; })}
          </div>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>08</span><h2>三大優勢放大</h2></header>
          <div className="pfm-v21-pdf-list">
            {[strength1, strength2, strength3].map((item, index) => { const advice = strengthAdvice(item, index); return <section key={`${item}-pdf-${index}`}><b>{index + 1}</b><div><small className="pfm-v22-pdf-category is-strength">{advice.category || '優勢放大'}</small><h3>{advice.title || item}</h3><p>{advice.summary}</p><p className="pfm-v22-pdf-meta is-strength"><strong>放大潛力：</strong>{advice.potential}　{ratingLabel(advice.potential)}</p><p><strong>放大方向：</strong>{advice.leverage}</p><p><strong>第一步：</strong>{advice.action}</p><p className="pfm-v22-pdf-quote is-strength"><strong>PFM 顧問提醒：</strong>{advice.quote}</p></div></section>; })}
          </div>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>09</span><h2>成長潛力藍圖</h2></header>
          <div className="pfm-v22-pdf-radar-layout">
            <div className="pfm-v22-pdf-radar"><RadarChart scores={radarScores} /></div>
            <div className="pfm-v22-pdf-capability-list">
              {capabilityItems.map((item) => <CapabilityCard key={`pdf-${item.key}`} item={item} compact />)}
            </div>
          </div>
          <section className="pfm-v21-pdf-insight"><h3>PFM 顧問解讀</h3><p>雷達圖用來快速看見目前五大能力的優勢與短板，能力卡提供每項能力的評估重點與改善方向，協助你掌握下一步優先改善順序。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>

        <article className="pfm-v21-pdf-page">
          <header><span>10</span><h2>90天改善路徑</h2></header>
          <div className="pfm-v21-pdf-roadmap"><section><b>1</b><h3>{firstPriority}</h3><p>先處理最能影響獲利與回流的第一優先事項。</p></section><section><b>2</b><h3>優化金流與廣告成本</h3><p>降低隱形成本，提升每一筆成交留下來的淨利。</p></section><section><b>3</b><h3>建立會員經營系統</h3><p>用標籤、回訪與再購流程提升顧客終身價值。</p></section></div>
          <section className="pfm-v21-pdf-final"><h3>顧問結論</h3><p>{consultantDirection}</p></section>
          <section className="pfm-v22-pdf-confidence"><div><small>PFM 商業診斷可信度</small><strong>{confidenceGrade(diagnosisConfidence)}｜{diagnosisConfidence}%</strong></div><p>此指標代表本次診斷結果的參考可信度，不代表店家的經營分數。</p></section>
          <footer>PFM Profit Flow Management</footer>
        </article>
      </section>
    </main>
  );
}
