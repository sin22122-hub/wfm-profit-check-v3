# PFM V22 Knowledge Engine

## 本版定位
V22 先處理「顧問內容大腦」與 PDF 閱讀節奏，不修改 Google Sheet 公式引擎。

## 已完成
- 新增 `src/data/pfmKnowledge.js` 顧問知識庫。
- 三大問題改為 Knowledge Library：不同 KPI 會帶出不同的原因、風險、第一步與顧問一句話。
- 三大優勢改為 Knowledge Library：不再讓「目前無明顯優勢」重複同一段文字。
- 三大問題／三大優勢卡片新增「影響程度／放大潛力」與顧問一句話。
- PDF 新增 Executive Summary 頁。
- PDF 新增健康度 Bar、漏斗視覺、雷達圖、90 天時間軸節奏。
- PDF 第 90 天改善路徑已避免直排與爆版。
- 保留 V21.7 的全站寬度與主要版型設定。

## 未修改
- 未修改 Google Sheet 公式。
- 未修改 Dashboard_Data / Client_Report / Consultant_Report 欄位。
- 未修改 Vercel 或 Google Form 設定。

## Build 驗證
- `npm install` 成功。
- `npm run build` 成功。

## 重要提醒
- 這包 ZIP 不包含 `node_modules`、`dist`、`package-lock.json`。
- 解壓後請先執行：

```bash
npm install
npm run dev
```

## 下一步：V23 / Scoring Engine
- 重建 Google Sheet 評分公式。
- 加入經營型態權重。
- 定義品牌成熟度與回流 SOP 等成熟度指標。
- 讓 Google Sheet、網頁、PDF 的分數與雷達圖完全一致。
