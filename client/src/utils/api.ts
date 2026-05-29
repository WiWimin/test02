const BASE_URL = 'http://localhost:3001/api'

const TOKEN_KEY = 'petcare_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: { code: string; message: string; details?: any }
}

async function request<T = any>(
  method: HttpMethod,
  path: string,
  body?: any,
  opts?: { formData?: boolean; signal?: AbortSignal }
): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const fetchOpts: RequestInit = { method, headers }
  if (opts?.signal) fetchOpts.signal = opts.signal

  if (body !== undefined) {
    if (opts?.formData) {
      fetchOpts.body = body
    } else {
      headers['Content-Type'] = 'application/json'
      fetchOpts.body = JSON.stringify(body)
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, fetchOpts)
  const json: ApiResponse<T> = await res.json()

  if (!json.ok) {
    const err = new Error(json.error?.message || '请求失败') as any
    err.code = json.error?.code || 'UNKNOWN'
    err.status = res.status
    err.details = json.error?.details
    throw err
  }

  return json.data as T
}

export const api = {
  get: <T = any>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, { signal }),
  post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => request<T>('PUT', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
  upload: <T = any>(path: string, formData: FormData) => request<T>('POST', path, formData, { formData: true }),
}
