// api calls to the backend
const BASE = 'http://localhost:3000/api/v1';

export function getToken() {
  return localStorage.getItem('evercup_token');
}
export function getUser() {
  const raw = localStorage.getItem('evercup_user');
  return raw ? JSON.parse(raw) : null;
}
export function saveSession(data) {
  localStorage.setItem('evercup_token', data.token);
  localStorage.setItem('evercup_user', JSON.stringify({
    staffId: data.staffId, username: data.username,
    fullName: data.fullName, role: data.role,
  }));
}
export function clearSession() {
  localStorage.removeItem('evercup_token');
  localStorage.removeItem('evercup_user');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // error format from the backend: { message, errors[] }
    const message = body.errors?.[0] || body.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  listCustomers: (search = '', page = 1) =>
    request(`/customers?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getCustomer: (id) => request(`/customers/${id}`),
  getCustomerByQr: (qrCode) => request(`/customers/qr/${encodeURIComponent(qrCode)}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  customerHistory: (id) => request(`/customers/${id}/point-transactions`),

  listRewards: (activeOnly = false) =>
    request(`/rewards${activeOnly ? '?isActive=true' : ''}`),
  createReward: (data) => request('/rewards', { method: 'POST', body: JSON.stringify(data) }),
  deleteReward: (id) => request(`/rewards/${id}`, { method: 'DELETE' }),
  setRewardServing: (id, isActive) =>
    request(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),

  awardPoints: (customerId, receiptNumber, purchaseAmount) =>
    request('/point-transactions', {
      method: 'POST',
      body: JSON.stringify({ customerId, receiptNumber, purchaseAmount }),
    }),

  redeem: (customerId, rewardId) =>
    request('/redemptions', { method: 'POST', body: JSON.stringify({ customerId, rewardId }) }),

  // member card (public)
  openCard: (email, memberCode) =>
    request('/customers/card', { method: 'POST', body: JSON.stringify({ email, memberCode }) }),
  resendCard: (email) =>
    request('/customers/card/resend', { method: 'POST', body: JSON.stringify({ email }) }),
};

// remember the member's card on this device
// try/catch because localStorage can be blocked in private mode
const CARD_KEY = 'evercup_member_card';

export function rememberCard(email, memberCode) {
  try { localStorage.setItem(CARD_KEY, JSON.stringify({ email, memberCode })); } catch { /* ignore */ }
}
export function recallCard() {
  try {
    const raw = localStorage.getItem(CARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function forgetCard() {
  try { localStorage.removeItem(CARD_KEY); } catch { /* ignore */ }
}
