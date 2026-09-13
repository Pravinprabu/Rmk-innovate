// Fetch wrapper for the super-admin section. This now shares one origin
// (port 3000) with the hospital-admin and staff sections, so every
// localStorage key is namespaced "superadmin_*" -- otherwise logging into
// one role would silently clobber another role's session.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getSession() {
  const access = localStorage.getItem('superadmin_access');
  const refresh = localStorage.getItem('superadmin_refresh');
  const profile = localStorage.getItem('superadmin_profile');
  if (!access) return null;
  return { access, refresh, profile: profile ? JSON.parse(profile) : null };
}

export function setSession({ access, refresh, profile }) {
  localStorage.setItem('superadmin_access', access);
  if (refresh) localStorage.setItem('superadmin_refresh', refresh);
  if (profile) localStorage.setItem('superadmin_profile', JSON.stringify(profile));
}

export function clearSession() {
  localStorage.removeItem('superadmin_access');
  localStorage.removeItem('superadmin_refresh');
  localStorage.removeItem('superadmin_profile');
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
    const res = await fetch(`${BASE_URL}/api/superadmin/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setSession({ access: data.access, refresh: session.refresh });
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

export const superAdminApi = {
  login: (username, password) => request('/api/superadmin/auth/login/', { method: 'POST', body: { username, password }, auth: false }),
  hospitals: {
    list: () => request('/api/superadmin/hospitals/'),
    create: (payload) => request('/api/superadmin/hospitals/', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/api/superadmin/hospitals/${id}/`, { method: 'PATCH', body: payload }),
    remove: (id) => request(`/api/superadmin/hospitals/${id}/`, { method: 'DELETE' }),
  },
  hospitalAdmins: {
    list: (hospitalId) => request(`/api/superadmin/hospital-admins/${hospitalId ? `?hospital=${hospitalId}` : ''}`),
    create: (payload) => request('/api/superadmin/hospital-admins/', { method: 'POST', body: payload }),
    remove: (id) => request(`/api/superadmin/hospital-admins/${id}/`, { method: 'DELETE' }),
  },
  analytics: () => request('/api/superadmin/analytics/'),
  systemConfig: () => request('/api/superadmin/system-config/'),
  profile: {
    get: () => request('/api/superadmin/profile/'),
    update: (formData) => requestMultipart('/api/superadmin/profile/', formData),
  },
};

export { ApiError };
