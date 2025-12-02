// frontend/src/api.js

export const BASE = 'http://localhost:5000';

export function setToken(t) {
  if (!t) localStorage.removeItem('token');
  else localStorage.setItem('token', t);
}

export function getToken() {
  return localStorage.getItem('token');
}

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

export const Api = {
  // auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // PERFIL
  me: () => request('/auth/me'),
  updateProfile: (payload) =>
    request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  changePassword: (payload) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // catálogo
  categories: () => request('/categorias'),
  listEvents: (query = '') => request(`/events${query}`),
  getEvent: (id) => request(`/events/${id}`),

  // compra de boletos
  buy: (evento_id, cantidad, localidad_id) =>
    request('/boletos/comprar', {
      method: 'POST',
      body: JSON.stringify({
        evento_id,
        cantidad,
        ...(localidad_id ? { localidad_id } : {}),
      }),
    }),

  myTickets: () => request('/boletos/mios'),

  adminStats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
}
