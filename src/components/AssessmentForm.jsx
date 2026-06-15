import React, { useMemo, useState } from 'react';

const moneyFields = new Set([
  'serviceRevenue', 'productRevenue', 'courseRevenue', 'otherRevenue',
  'materialCost', 'productCost', 'techCommission', 'assistantCommission', 'otherDirectCost',
  'managerSalary', 'staffSalary', 'laborInsurance', 'bonus', 'otherHR',
  'rent', 'utilities', 'internetPhone', 'posFee', 'cleaning', 'misc',
  'metaAds', 'googleAds', 'lineAds', 'kol', 'creative', 'otherAds', 'nonCashPayment'
]);

const sum = (data, keys) => keys.reduce((total, key) => total + Number(data[key] || 0), 0);
const twd = (value) => Number(value || 0).toLocaleString('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0
});

export default function AssessmentForm({ questions, onSubmit }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  const current = questions[step];

  const summary = useMemo(() => {
    const revenue = sum(data, ['serviceRevenue', 'productRevenue', 'courseRevenue', 'otherRevenue']);
    const directCost = sum(data, ['materialCost', 'productCost', 'techCommission', 'assistantCommission', 'otherDirectCost']);
    const hrCost = sum(data, ['managerSalary', 'staffSalary', 'laborInsurance', 'bonus', 'otherHR']);
    const fixedCost = sum(data, ['rent', 'utilities', 'internetPhone', 'posFee', 'cleaning', 'misc']);
    const adCost = sum(data, ['metaAds', 'googleAds', 'lineAds', 'kol', 'creative', 'otherAds']);
    const totalCustomers = Number(data.totalCustomers || 0);
    const returningCustomers = Number(data.returningCustomers || 0);
    const returningRate = totalCustomers ? returningCustomers / totalCustomers : 0;

    return {
      revenue,
      currentCost: directCost + hrCost + fixedCost + adCost,
      totalCustomers,
      returningRate
    };
  }, [data]);

  const updateValue = (key, value, isCheckbox = false) => {
    if (!isCheckbox) {
      setData((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setData((prev) => {
      const arr = Array.isArray(prev[key]) ? prev[key] : [];
      return arr.includes(value)
        ? { ...prev, [key]: arr.filter((x) => x !== value) }
        : { ...prev, [key]: [...arr, value] };
    });
  };

  const renderField = (field) => {
    const value = data[field.key] ?? field.defaultValue ?? '';

    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => updateValue(field.key, e.target.value)}>
          <option value="">請選擇</option>
          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    if (field.type === 'checkbox') {
      const arr = Array.isArray(data[field.key]) ? data[field.key] : [];
      return (
        <div className="checkbox-grid">
          {field.options.map((opt) => (
            <label key={opt} className="check-item">
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={() => updateValue(field.key, opt, true)}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        min={field.type === 'number' ? '0' : undefined}
        onChange={(e) => updateValue(field.key, e.target.value)}
        placeholder={moneyFields.has(field.key) ? '請輸入金額' : '請輸入'}
      />
    );
  };

  const progress = Math.round(((step + 1) / questions.length) * 100);

  return (
    <main className="form-page">
      <div className="form-layout">
        <aside className="form-sidebar">
          <div className="progress-card">
            <div className="step-indicator">Step {step + 1} / {questions.length}</div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <strong>{progress}% 完成</strong>
          </div>

          <div className="live-card">
            <p>即時健檢概況</p>
            <div><span>目前營收</span><strong>{twd(summary.revenue)}</strong></div>
            <div><span>目前成本</span><strong>{twd(summary.currentCost)}</strong></div>
            <div><span>來客數</span><strong>{summary.totalCustomers || 0}</strong></div>
            <div><span>回流率</span><strong>{(summary.returningRate * 100).toFixed(1)}%</strong></div>
          </div>

          <div className="step-list">
            {questions.map((q, index) => (
              <button
                key={q.id}
                className={index === step ? 'active' : index < step ? 'done' : ''}
                onClick={() => setStep(index)}
              >
                <span>{index + 1}</span>{q.title}
              </button>
            ))}
          </div>
        </aside>

        <section className="form-shell">
          <p className="eyebrow">PFM 美業獲利健檢</p>
          <h1>{current.title}</h1>
          <p>{current.description}</p>

          <div className="fields">
            {current.fields.map((field) => (
              <label className="field" key={field.key}>
                <span>{field.label}{field.required ? ' *' : ''}</span>
                {renderField(field)}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>上一步</button>
            {step < questions.length - 1 ? (
              <button className="btn" onClick={() => setStep(step + 1)}>下一步</button>
            ) : (
              <button className="btn" onClick={() => onSubmit(data)}>產出診斷報告</button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
