# PFM V22B.1 Data Mapping Hotfix

## 修正內容

### 1. 客戶經營力讀取修正
- 客戶經營力改為優先讀取 `Dashboard_Data!B20`。
- 同步支援 Apps Script 回傳格式：`raw.B20`、`cells.B20`、`Dashboard_Data!B20`、`rows[19][1]`、KPI 名稱 `客戶經營力`。
- 網頁第二章與 PDF 客戶經營分析頁同步修正。

### 2. 新版綜合分數與成長階段讀取修正
- 綜合分數改為優先讀取 `Dashboard_Data!B50`。
- 成長階段改為優先讀取 `Dashboard_Data!B51`。
- 避免前端重新計算結果覆蓋 Google Sheet 新版公式結果。

### 3. 五大能力雷達圖讀取修正
- 獲利能力優先讀取 `Dashboard_Data!B46`。
- 客戶經營優先讀取 `Dashboard_Data!B47`。
- 流量內容優先讀取 `Dashboard_Data!B48`。
- 廣告轉換優先讀取 `Dashboard_Data!B49`。
- 品牌成熟暫以數位成熟度作為 V22B 顯示來源，完整品牌成熟公式保留至 V23 Decision Engine。

### 4. 客單價移除核心呈現
- 獲利健康度總覽中，客單價卡片改為租金率卡片。
- PDF 獲利健康總覽中，客單價改為金流手續費率。
- 顧問解讀移除客單價作為獲利核心判斷的固定文字。

## 未修改內容
- 未修改 Google Sheet 公式。
- 未重建 V23 Decision Engine。
- 未變更 V22B Final 的主要 UI 設計。

## Build 驗證
- `npm install --no-audit --no-fund`：PASS
- `npm run build`：PASS
