// Fetch wrapper for the hospital-admin section. Shares one origin
// (port 3000) with the super-admin and staff sections, so every localStorage
// key is namespaced "hospitaladmin_*" -- otherwise logging into one role
// would silently clobber another role's session.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getSession() {
  const access = localStorage.getItem('hospitaladmin_access');
  const refresh = localStorage.getItem('hospitaladmin_refresh');
  const profile = localStorage.getItem('hospitaladmin_profile');
  if (!access) return null;
  return { access, refresh, profile: profile ? JSON.parse(profile) : null };
}

export function setSession({ access, refresh, profile }) {
  localStorage.setItem('hospitaladmin_access', access);
  if (refresh) localStorage.setItem('hospitaladmin_refresh', refresh);
  if (profile) localStorage.setItem('hospitaladmin_profile', JSON.stringify(profile));
}

export function clearSession() {
  localStorage.removeItem('hospitaladmin_access');
  localStorage.removeItem('hospitaladmin_refresh');
  localStorage.removeItem('hospitaladmin_profile');
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
    const res = await fetch(`${BASE_URL}/api/hospital/auth/refresh/`, {
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
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const contentType = response.headers.get('content-type') || '';
      const message = contentType.includes('text/html')
        ? `The API returned an HTML page for ${path}. Check the backend logs for the server error.`
        : `The API returned an invalid response for ${path} (${response.status}).`;
      throw new ApiError(message, response.status, text);
    }
  }

  if (!response.ok) {
    const firstFieldError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
    const message = (data && (data.detail || data.non_field_errors?.[0] || firstFieldError)) || `Request failed (${response.status})`;
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
    const firstFieldError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
    const message = (data && (data.detail || data.non_field_errors?.[0] || firstFieldError)) || `Request failed (${response.status})`;
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

export const hospitalApi = {
  login: (username, password) => request('/api/hospital/auth/login/', { method: 'POST', body: { username, password }, auth: false }),
  me: () => request('/api/hospital/auth/me/'),
  doctors: {
    list: () => request('/api/hospital/staff/doctors/'),
    create: (payload) => request('/api/hospital/staff/doctors/', { method: 'POST', body: payload }),
    remove: (id) => request(`/api/hospital/staff/doctors/${id}/`, { method: 'DELETE' }),
  },
  triage: {
    list: () => request('/api/hospital/staff/triage/'),
    create: (payload) => request('/api/hospital/staff/triage/', { method: 'POST', body: payload }),
    remove: (id) => request(`/api/hospital/staff/triage/${id}/`, { method: 'DELETE' }),
  },
  patients: {
    list: () => request('/api/hospital/patients/'),
  },
  departments: {
    list: () => request('/api/hospital/departments/'),
    create: (payload) => request('/api/hospital/departments/', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/api/hospital/departments/${id}/`, { method: 'PATCH', body: payload }),
    remove: (id) => request(`/api/hospital/departments/${id}/`, { method: 'DELETE' }),
  },
  profile: {
    get: () => request('/api/hospital/profile/'),
    update: (formData) => requestMultipart('/api/hospital/profile/', formData),
  },
};

export { ApiError };
