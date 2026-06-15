export const money = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  });
};

export const percent = (value) => {
  const n = Number(value || 0);
  return `${(n * 100).toFixed(2)}%`;
};
