export const questions = [
  {
    id: 'store',
    title: '店家資訊',
    description: '先讓我們了解店家的基本狀況。',
    fields: [
      { key: 'storeName', label: '店家名稱', type: 'text', required: true },
      { key: 'contactName', label: '聯絡人姓名', type: 'text', required: true },
      { key: 'phone', label: '聯絡電話', type: 'text' },
      { key: 'instagram', label: 'Instagram 帳號', type: 'text' },
      { key: 'storeType', label: '店面類型', type: 'select', options: ['個人工作室', '單店', '複合式', '多店經營', '其他'], required: true },
      { key: 'branchCount', label: '分店數', type: 'number', defaultValue: 1 },
      { key: 'month', label: '本次填寫月份', type: 'month' }
    ]
  },
  {
    id: 'revenue',
    title: '營收結構',
    description: '請填寫本月各類型收入。',
    fields: [
      { key: 'serviceRevenue', label: '服務收入', type: 'number', required: true },
      { key: 'productRevenue', label: '商品收入', type: 'number' },
      { key: 'courseRevenue', label: '課程收入', type: 'number' },
      { key: 'otherRevenue', label: '其他收入', type: 'number' }
    ]
  },
  {
    id: 'cost',
    title: '成本結構',
    description: '請填寫本月主要成本與費用。若沒有該項目可填 0。',
    fields: [
      { key: 'materialCost', label: '耗材成本', type: 'number' },
      { key: 'productCost', label: '商品成本', type: 'number' },
      { key: 'techCommission', label: '技術抽成', type: 'number' },
      { key: 'assistantCommission', label: '助理抽成', type: 'number' },
      { key: 'otherDirectCost', label: '其他直接成本', type: 'number' },
      { key: 'managerSalary', label: '店長薪資', type: 'number' },
      { key: 'staffSalary', label: '員工薪資', type: 'number' },
      { key: 'laborInsurance', label: '勞健保', type: 'number' },
      { key: 'bonus', label: '獎金', type: 'number' },
      { key: 'otherHR', label: '其他人事支出', type: 'number' },
      { key: 'rent', label: '租金', type: 'number' },
      { key: 'utilities', label: '水電費', type: 'number' },
      { key: 'internetPhone', label: '網路電話費', type: 'number' },
      { key: 'posFee', label: 'POS 系統費用', type: 'number' },
      { key: 'cleaning', label: '清潔費', type: 'number' },
      { key: 'misc', label: '雜項支出', type: 'number' },
      { key: 'metaAds', label: 'Meta 廣告', type: 'number' },
      { key: 'googleAds', label: 'Google 廣告', type: 'number' },
      { key: 'lineAds', label: 'LINE 廣告', type: 'number' },
      { key: 'kol', label: 'KOL／網紅合作', type: 'number' },
      { key: 'creative', label: '素材設計／拍攝', type: 'number' },
      { key: 'otherAds', label: '其他廣告支出', type: 'number' },
      { key: 'nonCashPayment', label: '非現金收款總金額', type: 'number' }
    ]
  },
  {
    id: 'social',
    title: '數位經營',
    description: '請填寫目前社群與內容經營狀況。',
    fields: [
      { key: 'socialActive', label: '目前是否有經營社群媒體？', type: 'select', options: ['有固定經營', '偶爾經營', '幾乎沒有'] },
      { key: 'platforms', label: '目前主要經營哪些平台？', type: 'checkbox', options: ['Instagram', 'Facebook', 'Threads', 'TikTok', 'LINE官方帳號', '小紅書', '其他'] },
      { key: 'weeklyPosts', label: '平均每週發文次數？', type: 'select', options: ['0篇', '1篇', '2~3篇', '3~4篇', '5篇以上'] },
      { key: 'shortVideo', label: '目前是否有固定產出短影音？', type: 'select', options: ['每週都有', '偶爾有', '幾乎沒有'] },
      { key: 'mainPain', label: '目前最大的經營困擾是什麼？', type: 'text' },
      { key: 'growthGoal', label: '目前最希望改善哪些經營成果？', type: 'text' },
      { key: 'learningPreference', label: '您比較偏好的學習方式？', type: 'text' }
    ]
  },
  {
    id: 'customer',
    title: '客戶經營',
    description: '請填寫本月客戶來源與來客狀況。',
    fields: [
      { key: 'totalCustomers', label: '本月總來客數', type: 'number', required: true },
      { key: 'newCustomers', label: '本月新客數', type: 'number', required: true },
      { key: 'returningCustomers', label: '本月回流客數', type: 'number', required: true },
      { key: 'referralCustomers', label: '本月介紹客數', type: 'number' },
      { key: 'customerChannels', label: '客主要來自哪些管道？', type: 'text' },
      { key: 'stableSource', label: '目前最穩定的新客來源是？', type: 'text' }
    ]
  },
  {
    id: 'funnel',
    title: '轉換漏斗',
    description: '若沒有投放廣告，可填 0。',
    fields: [
      { key: 'adLeads', label: '本月廣告導入名單數', type: 'number' },
      { key: 'bookings', label: '本月預約數', type: 'number' },
      { key: 'visits', label: '本月到店數', type: 'number' },
      { key: 'deals', label: '本月成交數', type: 'number' },
      { key: 'adTracking', label: '是否有追蹤廣告成效？', type: 'select', options: ['有固定追蹤', '偶爾看', '沒有追蹤'] }
    ]
  }
];
