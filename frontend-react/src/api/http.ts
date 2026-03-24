export class ApiError extends Error {
  status: number
  errors: Record<string, string>

  constructor(message: string, status = 500, errors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080/api/v1'

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  const resolvedToken = token ?? localStorage.getItem('ruell.token')
  if (resolvedToken) headers.set('Authorization', `Bearer ${resolvedToken}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const json = await response.json().catch(() => ({}))
  if (!response.ok || json.ok === false) {
    throw new ApiError(json.message ?? `HTTP ${response.status}`, response.status, json.errors ?? {})
  }
  return (json.data ?? json) as T
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' }, token)
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }, token)
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token)
}
