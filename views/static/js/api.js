// Minimal API helper used by the static pages
const BASE_URL = window.BASE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) {
    if (body instanceof FormData) {
      opts.body = body; // browser sets content-type
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(BASE_URL + path, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) throw { status: res.status, body: data };
  return data;
}

async function login(username, password) {
  return request('/api/auth/login', { method: 'POST', body: { Username: username, Password: password } });
}

async function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: payload });
}

async function fetchWithAuth(path, method = 'GET', token, body) {
  return request(path, { method, token, body });
}

// Export in browser
window.Api = { request, login, register, fetchWithAuth };
