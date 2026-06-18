import React, { useState } from 'react';

import HomePage from './components/HomePage.jsx';
import AssessmentForm from './components/AssessmentForm.jsx';
import ResultDashboard from './components/ResultDashboard.jsx';

import { questions } from './data/questions.js';
import { calculateDiagnosis } from './utils/calculations.js';
import { submitToGoogleForm } from './utils/googleFormApi.js';
import { fetchDashboardData } from './utils/sheetApi.js';

export default function App() {
  const [view, setView] = useState('home');
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startAssessment = () => {
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const handleSubmit = async (data) => {
  try {
    setIsSubmitting(true);

    await submitToGoogleForm(data);

    // 等待 Google Sheet 完成寫入與公式更新
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const sheetResult = await fetchDashboardData();

    setFormData(data);
    setResult(sheetResult);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('PFM submit/read failed:', error);
    alert('資料送出或讀取結果失敗，請稍後再試。');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">PFM</div>
          <div>
            <strong>PFM 美業獲利健檢™</strong>
            <span>Profit Flow Management</span>
          </div>
        </div>
        <button className="btn small" onClick={startAssessment}>
          開始健檢
        </button>
      </header>

      {view === 'home' && <HomePage onStart={startAssessment} />}
      {view === 'form' && (
        <AssessmentForm
          questions={questions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
      {view === 'result' && result && (
        <ResultDashboard
          result={result}
          formData={formData}
          onRestart={startAssessment}
        />
      )}
    </>
  );
}
