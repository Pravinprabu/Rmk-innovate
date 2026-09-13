// Fetch wrapper for the staff section (doctor + triage, one shared login
// with a role toggle). Shares one origin (port 3000) with the super-admin
// and hospital-admin sections, so every localStorage key is namespaced
// "staff_*" -- otherwise logging into one role would silently clobber
// another role's session. Only one of doctor/triage is ever logged in at a
// time in this section, so the session also stores which one it is (needed
// to know whether to hit the doctor or triage refresh endpoint).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getSession() {
  const access = localStorage.getItem('staff_access');
  const refresh = localStorage.getItem('staff_refresh');
  const profile = localStorage.getItem('staff_profile');
  const role = localStorage.getItem('staff_role');
  if (!access || !role) return null;
  return { access, refresh, role, profile: profile ? JSON.parse(profile) : null };
}

export function setSession({ access, refresh, profile, role }) {
  localStorage.setItem('staff_access', access);
  localStorage.setItem('staff_role', role);
  if (refresh) localStorage.setItem('staff_refresh', refresh);
  if (profile) localStorage.setItem('staff_profile', JSON.stringify(profile));
}

export function clearSession() {
  localStorage.removeItem('staff_access');
  localStorage.removeItem('staff_refresh');
  localStorage.removeItem('staff_profile');
  localStorage.removeItem('staff_role');
}

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function refreshAccessToken() {
  const session = getSession();
  if (!session?.refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/${session.role}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setSession({ access: data.access, refresh: session.refresh, role: session.role, profile: session.profile });
    return data.access;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, auth = true, _retried = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const session = getSession();
    if (session?.access) headers['Authorization'] = `Bearer ${session.access}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`Could not reach the server at ${BASE_URL}. Check that the backend is running and its CORS settings allow this origin.`, 0, null);
  }

  if (response.status === 401 && auth && !_retried) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return request(path, { method, body, auth, _retried: true });
    clearSession();
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.detail || data.non_field_errors?.[0] || JSON.stringify(data))) || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }
  return data;
}

// Same as request(), but sends a FormData body (multipart) instead of
// JSON -- needed for the Profile page's photo upload. No 'Content-Type'
// header set here on purpose: fetch builds its own multipart boundary only
// when it sets the header itself.
async function requestMultipart(path, formData, { method = 'PATCH' } = {}) {
  const headers = {};
  const session = getSession();
  if (session?.access) headers['Authorization'] = `Bearer ${session.access}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: formData });
  } catch {
    throw new ApiError(`Could not reach the server at ${BASE_URL}. Check that the backend is running and its CORS settings allow this origin.`, 0, null);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.detail || data.non_field_errors?.[0] || JSON.stringify(data))) || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }
  return data;
}

export async function callApi(fn) {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message || 'Something went wrong talking to the server.' };
  }
}

// Public, unauthenticated -- the hospital dropdown on the login page.
export const publicApi = {
  hospitals: () => request('/api/hospitals/', { auth: false }),
};

export const doctorApi = {
  login: (username, password, hospital) => request('/api/doctor/auth/login/', { method: 'POST', body: { username, password, hospital }, auth: false }),
  me: () => request('/api/doctor/auth/me/'),
  queue: () => request('/api/doctor/dashboard/queue/'),
  stats: () => request('/api/doctor/dashboard/stats/'),
  // Token-number lookup is OTP-gated now -- requestOtp sends a code to the
  // patient's registered mobile (real SMS for real numbers, the fixed
  // "1234" demo code for the seeded placeholder-number patients), and only
  // verifyOtp (with that code) actually returns the record.
  requestOtp: (params) => request('/api/doctor/patient-lookup/request-otp/', { method: 'POST', body: params }),
  verifyOtp: (params, otp) => request('/api/doctor/patient-lookup/verify-otp/', { method: 'POST', body: { ...params, otp } }),
  confirmEncounter: (encounterId) => request(`/api/doctor/patient-review/${encounterId}/confirm/`, { method: 'POST' }),
  rejectEncounter: (encounterId) => request(`/api/doctor/patient-review/${encounterId}/reject/`, { method: 'POST' }),
  bookings: () => request('/api/doctor/bookings/'),
  updateAiSummary: (summaryId, summaryText) =>
    request(`/api/doctor/ai-summary/${summaryId}/`, { method: 'PATCH', body: { summary_text: summaryText } }),
  profile: {
    get: () => request('/api/doctor/profile/'),
    update: (formData) => requestMultipart('/api/doctor/profile/', formData),
  },
};

export const triageApi = {
  login: (username, password, hospital) => request('/api/triage/auth/login/', { method: 'POST', body: { username, password, hospital }, auth: false }),
  me: () => request('/api/triage/auth/me/'),
  queue: (departmentId) => request(`/api/triage/queue/${departmentId ? `?department=${departmentId}` : ''}`),
  alerts: () => request('/api/triage/alerts/'),
  acknowledgeAlert: (encounterId) => request(`/api/triage/alerts/${encounterId}/acknowledge/`, { method: 'POST' }),
  bookings: () => request('/api/triage/bookings/'),
  departments: () => request('/api/triage/departments/'),
  createEmergencyToken: (payload) => request('/api/triage/emergency-token/', { method: 'POST', body: payload }),
  profile: {
    get: () => request('/api/triage/profile/'),
    update: (formData) => requestMultipart('/api/triage/profile/', formData),
  },
};

export { ApiError };
