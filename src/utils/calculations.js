const n = (v) => Number(v || 0);
const safeDiv = (a, b) => (b ? a / b : 0);

const scoreSocial = (data) => {
  if ((data.socialActive || '').includes('沒有') || (data.socialActive || '').includes('幾乎')) return 0;
  const count = Array.isArray(data.platforms) ? data.platforms.length : 0;
  if (count === 0) return 30;
  return Math.min(100, 50 + count * 15);
};

const scoreContent = (data) => {
  const posts = data.weeklyPosts || '';
  let base = 50;
  if (posts.includes('0')) base = 10;
  else if (posts.includes('1')) base = 35;
  else if (posts.includes('2') || posts.includes('3')) base = 60;
  else if (posts.includes('4') || posts.includes('5')) base = 80;
  const videoBonus = (data.shortVideo || '').includes('每週') ? 20 : 0;
  return Math.min(100, base + videoBonus);
};

const actionMap = {
  '客戶經營力不足': '建立會員回購機制',
  '回流率偏低': '建立回流機制',
  '毛利率偏低': '優化服務毛利結構',
  '淨利率偏低': '優化成本與利潤結構',
  '廣告成本偏高': '檢視廣告成本與投放效益',
  '租金壓力偏高': '檢視固定成本壓力',
  '人事成本偏高': '優化人力配置'
};

const stageDescription = {
  '求生期': '目前仍以維持營運為主，建議優先改善獲利與回流能力。',
  '穩定期': '已具備基本營運基礎，建議建立會員與回流系統。',
  '成長期': '已具備穩定成長條件，應建立可複製的獲客與經營模式。',
  '擴張期': '具備擴張條件，建議將重心放在品牌、管理與複製系統。'
};

export function calculateDiagnosis(data) {
  const revenue = n(data.serviceRevenue) + n(data.productRevenue) + n(data.courseRevenue) + n(data.otherRevenue);

  const directCost = n(data.materialCost) + n(data.productCost) + n(data.techCommission) +
    n(data.assistantCommission) + n(data.otherDirectCost);

  const hrCost = n(data.managerSalary) + n(data.staffSalary) + n(data.laborInsurance) +
    n(data.bonus) + n(data.otherHR);

  const operationCost = n(data.rent) + n(data.utilities) + n(data.internetPhone) + n(data.posFee) +
    n(data.cleaning) + n(data.misc);

  const adCost = n(data.metaAds) + n(data.googleAds) + n(data.lineAds) + n(data.kol) +
    n(data.creative) + n(data.otherAds);

  const paymentFee = n(data.nonCashPayment) * 0.03;
  const grossProfit = revenue - directCost;
  const grossMargin = safeDiv(grossProfit, revenue);
  const totalExpense = hrCost + operationCost + adCost + paymentFee;
  const netProfit = grossProfit - totalExpense;
  const netMargin = safeDiv(netProfit, revenue);
  const averageTicket = safeDiv(revenue, n(data.totalCustomers));

  const returningRate = safeDiv(n(data.returningCustomers), n(data.totalCustomers));
  const newRate = safeDiv(n(data.newCustomers), n(data.totalCustomers));
  const referralRate = safeDiv(n(data.referralCustomers), n(data.totalCustomers));

  const customerScore = Number(((returningRate * 100) * 0.4 + (newRate * 100) * 0.4 + (referralRate * 100) * 0.2).toFixed(2));
  const socialScore = scoreSocial(data);
  const contentScore = scoreContent(data);
  const digitalScore = Math.round(socialScore * 0.5 + contentScore * 0.5);

  const adRate = safeDiv(adCost, revenue);
  let adCostSeverity = 0;
  if (adRate > 0.2) adCostSeverity = 120;
  else if (adRate > 0.15) adCostSeverity = 60;
  else if (adRate > 0.1) adCostSeverity = 20;

  const problemScores = [
    ['客戶經營力不足', (100 - customerScore) * 3],
    ['回流率偏低', (100 - returningRate * 100) * 3],
    ['毛利率偏低', (100 - grossMargin * 100) * 2],
    ['淨利率偏低', (100 - netMargin * 100) * 2],
    ['廣告成本偏高', adCostSeverity],
    ['租金壓力偏高', safeDiv(n(data.rent), revenue) > 0.12 ? (safeDiv(n(data.rent), revenue) - 0.12) * 100 * 10 : 0],
    ['人事成本偏高', safeDiv(hrCost, revenue) > 0.45 ? (safeDiv(hrCost, revenue) - 0.45) * 100 * 10 : 0]
  ].sort((a, b) => b[1] - a[1]);

  const problems = problemScores.slice(0, 3).map((x) => x[0]);

  const advantages = [
    ['毛利率表現優秀', grossMargin >= 0.8 ? grossMargin * 100 : 0],
    ['淨利率表現優秀', netMargin >= 0.15 ? netMargin * 100 : 0],
    ['回流率表現優秀', returningRate >= 0.4 ? returningRate * 100 : 0],
    ['高客單價優勢', averageTicket >= 8000 ? averageTicket / 1000 : 0],
    ['介紹客來源穩定', referralRate >= 0.3 ? referralRate * 100 : 0]
  ].sort((a, b) => b[1] - a[1]).filter((x) => x[1] > 0).slice(0, 3).map((x) => x[0]);

  while (advantages.length < 3) {
    advantages.push(`目前無明顯第${advantages.length + 1}優勢`);
  }

  const growthScore = Math.round(
    (grossMargin * 100) * 0.25 +
    (netMargin * 100) * 0.25 +
    (returningRate * 100) * 0.20 +
    customerScore * 0.20 +
    digitalScore * 0.10
  );

  const stage = growthScore >= 85 ? '擴張期' : growthScore >= 70 ? '成長期' : growthScore >= 50 ? '穩定期' : '求生期';

  const opportunityLevel = returningRate < 0.2 ? '極高' : returningRate < 0.4 ? '高' : returningRate < 0.6 ? '中' : '低';

  const consultantText = {
    '極高': '目前高度依賴新客，回流與會員機制仍有很大成長空間。建議優先建立回流系統，降低對新客開發的依賴。',
    '高': '目前回流基礎仍偏弱，營收仍有相當比例來自新客。建議優先強化會員經營、回訪提醒與客戶關係維護。',
    '中': '回流結構已逐步成形，可透過提升客單價、會員分級與回購頻率進一步放大獲利。',
    '低': '目前回流系統相對成熟，建議將重心放在品牌擴張、團隊管理與第二成長曲線。'
  }[opportunityLevel];

  return {
    revenue,
    grossMargin,
    netMargin,
    averageTicket,
    returningRate,
    customerScore,
    socialScore,
    contentScore,
    digitalScore,
    problems,
    advantages,
    actions: problems.map((p) => actionMap[p] || ''),
    growthScore,
    stage,
    stageText: stageDescription[stage],
    opportunity: {
      returningGap: 1 - returningRate,
      convertibleRevenue: revenue * (1 - returningRate),
      profitPotential: revenue * (1 - returningRate) * netMargin,
      level: opportunityLevel,
      consultantText
    }
  };
}
