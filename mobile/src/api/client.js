// Fetch wrapper for the patient mobile app. Deliberately carries NO shared
// secret -- unlike frontend/src/api/client.js (the kiosk), which sends
// X-Kiosk-Key because that app only ever runs on hardware you control, this
// app runs on a random patient's own phone. Every endpoint it calls
// (backend/apps/mobile/* and the public /api/hospitals/ list) is
// intentionally public/unauthenticated. Do not "helpfully" add the kiosk
// key here later -- see backend/apps/mobile/permissions.py's docstring for
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://192.168.1.4:8000';
};
const BASE_URL = getBaseUrl();

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`Could not reach the server at ${BASE_URL}. Check that the backend is running.`, 0, null);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.detail || JSON.stringify(data))) || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }
  return data;
}

// Same as request(), but sends a FormData body (multipart) instead of JSON --
// needed for document upload, which attaches a real file. No 'Content-Type'
// header is set here on purpose: fetch sets its own multipart boundary only
// when it builds the header itself, which it won't do if we set one manually.
async function requestMultipart(path, formData) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method: 'POST', body: formData });
  } catch {
    throw new ApiError(`Could not reach the server at ${BASE_URL}. Check that the backend is running.`, 0, null);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.detail || JSON.stringify(data))) || `Request failed (${response.status})`;
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

export const mobileApi = {
  searchHospitals: (query) => request(`/api/hospitals/?q=${encodeURIComponent(query)}`),
  departments: (hospitalId) => request(`/api/mobile/hospitals/${hospitalId}/departments/`),
  // Availability is per-department, not just per-hospital -- a booked ENT
  // 10am slot doesn't affect General's 10am slot at the same hospital.
  slots: (hospitalId, departmentId, date) =>
    request(`/api/mobile/hospitals/${hospitalId}/slots/?date=${date}&department=${departmentId}`),
  createBooking: (payload) => request('/api/mobile/bookings/', { method: 'POST', body: payload }),
  // "Login" -- finds/creates the patient by ABHA ID and a "home" encounter
  // to attach documents to (apps/mobile/identify/views.py). Called once,
  // right after consent, before the Book/Upload choice.
  identify: (payload) => request('/api/mobile/identify/', { method: 'POST', body: payload }),
  // Reports tab's Upload/Scan buttons ask which hospital first -- this
  // resolves (or creates) the encounter at THAT hospital to attach the
  // document to, instead of the generic "home" one from identify().
  resolveUploadEncounter: (patientId, hospitalId) =>
    request('/api/mobile/documents/encounter/', { method: 'POST', body: { patient_id: patientId, hospital_id: hospitalId } }),
  uploadDocument: (encounterId, category, file) => {
    const formData = new FormData();
    formData.append('encounter', encounterId);
    formData.append('category', category);
    formData.append('file', file);
    return requestMultipart('/api/mobile/documents/', formData);
  },
  listDocuments: (patientId) => request(`/api/mobile/documents/list/?patient_id=${patientId}`),
  listAiSummaries: (patientId) => request(`/api/mobile/ai-summaries/?patient_id=${patientId}`),
  submitAiSummary: (payload) => request('/api/mobile/ai-summaries/', { method: 'POST', body: payload }),
  getProfile: (patientId) => request(`/api/mobile/profile/?patient_id=${patientId}`),
};

export { ApiError };
