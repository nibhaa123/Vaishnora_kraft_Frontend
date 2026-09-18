import { getCustomer } from './auth'

const defaultBackendUrl = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://vaishnora-kraft-backend.onrender.com'

export const backendUrl = (
  import.meta.env.VITE_BACKEND_URL || defaultBackendUrl
).replace(/\/$/, '')

export const apiFetch = (path, options = {}) => {
  const customer = getCustomer()
  const headers = new Headers(options.headers || {})
  if (customer?.token) headers.set('Authorization', `Bearer ${customer.token}`)
  return fetch(`${backendUrl}${path}`, { ...options, headers })
}

export const getBackendUrl = (path = '') => {
  if (!path || /^(https?:|data:)/.test(path)) return path
  if (!path.startsWith('/uploads/')) return path
  return `${backendUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export const readApiError = async (response, fallback) => {
  try {
    const result = await response.json()
    return result.error || fallback
  } catch {
    return fallback
  }
}
