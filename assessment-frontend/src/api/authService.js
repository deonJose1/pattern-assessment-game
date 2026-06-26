// Auth API calls + session persistence. Keeps localStorage keys in one place so
// the rest of the app (axiosClient, ProtectedRoute) stays in sync.

import axiosClient, { TOKEN_KEY } from './axiosClient'

/**
 * POST /api/auth/login -> { token, email, role }
 * Persists the JWT and session flags, then returns the response payload.
 * Throws the Axios error on failure (e.g. 401 wrong password) for the caller.
 */
export async function login(email, password) {
  const { data } = await axiosClient.post('/api/auth/login', { email, password })

  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem('adminEmail', data.email)
  localStorage.setItem('adminRole', data.role)
  // Kept for the existing ProtectedRoute gate in App.jsx.
  localStorage.setItem('isAdminAuth', 'true')

  return data
}

/** Stateless logout: drop the token/session locally (JWT has no server session). */
export function logout() {
  // Best-effort server notify; ignore failures since logout is purely local.
  axiosClient.post('/api/auth/logout').catch(() => {})

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('adminEmail')
  localStorage.removeItem('adminRole')
  localStorage.removeItem('isAdminAuth')
}
