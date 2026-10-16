const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getToken = () => localStorage.getItem('token');

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Pembungkus fetch: mengirim JSON atau FormData (upload), menambah token jika ada,
// dan melempar Error dengan pesan dari backend jika gagal.
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form; // browser mengatur Content-Type multipart sendiri
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
  }

  const result = await readJson(response);
  if (!result || !result.success) {
    // Token kedaluwarsa: keluarkan user dari sesi
    if (response.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new Error(result?.message || 'Terjadi kesalahan pada server');
  }
  return result;
}

// Download CV butuh token, jadi tidak bisa memakai link biasa.
export async function downloadCv(id, filename) {
  let response;
  try {
    response = await fetch(`${API_URL}/cv/${id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server');
  }
  if (!response.ok) {
    const result = await readJson(response);
    throw new Error(result?.message || 'Gagal mengunduh CV');
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
