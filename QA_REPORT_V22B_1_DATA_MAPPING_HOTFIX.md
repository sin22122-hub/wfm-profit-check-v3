# QA Report - V22B.1 Data Mapping Hotfix

## Build
- npm install: PASS
- npm run build: PASS

## Data Mapping Checklist
- Dashboard_Data!B20 客戶經營力：已加入優先讀取與多格式 fallback。
- Dashboard_Data!B46 獲利能力分數：已加入優先讀取。
- Dashboard_Data!B47 客戶經營成熟度分數：已加入優先讀取。
- Dashboard_Data!B48 流量內容成熟度分數：已加入優先讀取。
- Dashboard_Data!B49 廣告轉換效率分數：已加入優先讀取。
- Dashboard_Data!B50 新版綜合分數：已加入優先讀取。
- Dashboard_Data!B51 新版成長階段：已加入優先讀取。

## UI/PDF Checklist
- 網頁第二章客戶經營力：改讀 B20 來源。
- PDF 客戶經營分析：同步改讀 B20 來源。
- 獲利健康總覽：客單價從核心呈現中移除。
- PDF 獲利健康總覽：客單價改為金流手續費率。

## Known Note
若 Apps Script 目前完全沒有回傳 B20 / B46:B51 或 Dashboard_Data 原始列資料，前端無法憑空讀取 Google Sheet 儲存格。此版本已支援多種回傳格式；若上線後仍未讀取到，下一步需要同步調整 Apps Script 回傳欄位。
