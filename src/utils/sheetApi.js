export async function submitToGoogleSheet(payload) {
  const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!endpoint) {
    console.warn('尚未設定 VITE_GOOGLE_SCRIPT_URL，目前使用前端本地計算。');
    return null;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });

  if (!res.ok) throw new Error('送出 Google Sheet 失敗');
  return res.json();
}
