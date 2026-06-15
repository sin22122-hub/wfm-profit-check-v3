# PFM 美業獲利健檢 V2

## 使用方式

```bash
npm install
npm run dev
```

## Vercel 設定

- Framework: Vite
- Build command: npm run build
- Output directory: dist

## 專案結構

- `src/main.jsx`：React 入口
- `src/App.jsx`：頁面切換
- `src/components/HomePage.jsx`：首頁
- `src/components/AssessmentForm.jsx`：六步驟問卷
- `src/components/ResultDashboard.jsx`：診斷結果頁
- `src/data/questions.js`：題庫
- `src/utils/calculations.js`：前端診斷公式
- `src/utils/sheetApi.js`：預留 Google Sheet API 串接
