const API_BASE = '/api';

// read response bodies even on failures
async function handleResponse(res, path, method) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.error ||
      `HTTP ${res.status} error on ${method} ${path}`;
    throw new Error(message);
  }
  return data;
}

const api = {
  async get(path) {
    const res = await fetch(API_BASE + path);
    return handleResponse(res, path, 'GET');
  },

  async post(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res, path, 'POST');
  },

  async put(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res, path, 'PUT');
  },

  async delete(path) {
    const res = await fetch(API_BASE + path, {
      method: 'DELETE',
    });
    return handleResponse(res, path, 'DELETE');
  },
};
