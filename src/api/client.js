const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

async function formRequest(path, body, token = null) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: new URLSearchParams(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

// ---- AUTH ----
export const authAPI = {
  register: (username, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    formRequest('/auth/login', { username, password }),
}

// ---- SLOTS ----
export const slotsAPI = {
  getAll: (token) => request('/slots/', {}, token),

  getOne: (id, token) => request(`/slots/${id}`, {}, token),

  create: (data, token) =>
    request('/slots/', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (id, data, token) =>
    request(`/slots/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  delete: (id, token) =>
    fetch(`${BASE}/slots/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Delete failed') })
    }),
}

// ---- BOOKINGS ----
export const bookingsAPI = {
  getAll: (token) => request('/bookings/', {}, token),

  getMine: (token) => request('/bookings/me', {}, token),

  create: (data, token) =>
    request('/bookings/', { method: 'POST', body: JSON.stringify(data) }, token),

  cancel: (id, token) =>
    fetch(`${BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => { throw new Error(d.detail || 'Cancel failed') })
    }),
}
