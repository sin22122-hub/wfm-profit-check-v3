const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxddc6ekNXyyJNxtjAB-4F6ANol7pK21P8Jm0mWgBls9i_CBAUBGkeoVydiDokkWA/exec';

export async function submitToGoogleForm(data) {
  await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(data),
  });

  return true;
}
