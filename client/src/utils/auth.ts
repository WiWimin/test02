import { api, getToken, setToken, removeToken } from './api'

export type UserRole = 'owner' | 'sitter' | 'admin'

export interface UserInfo {
  id: string
  name: string
  phone: string
  role: UserRole
  avatar: string
  account?: string
  sitter_status?: string
  sitter_profile?: any
}

export function isLoggedIn(): boolean {
  return getToken() !== null
}

export async function login(account: string, password: string): Promise<{ token: string; user: UserInfo }> {
  const data = await api.post<{ token: string; user: UserInfo }>('/auth/login', { account, password, loginMethod: 'account' })
  setToken(data.token)
  const cached = { ...data.user, isLoggedIn: true }
  localStorage.setItem('petcare_user', JSON.stringify(cached))
  return data
}

export async function register(params: {
  phone: string
  password: string
  name: string
  role: UserRole
  code: string
}): Promise<{ token: string; user: UserInfo }> {
  const data = await api.post<{ token: string; user: UserInfo }>('/auth/register', params)
  setToken(data.token)
  const cached = { ...data.user, isLoggedIn: true }
  localStorage.setItem('petcare_user', JSON.stringify(cached))
  return data
}

export function logout() {
  removeToken()
  localStorage.removeItem('petcare_user')
}

export async function fetchCurrentUser(): Promise<UserInfo | null> {
  try {
    return await api.get<UserInfo>('/auth/me')
  } catch {
    return null
  }
}

export function getCurrentUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem('petcare_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function updateUserProfile(patch: Partial<UserInfo>): Promise<UserInfo> {
  const data = await api.put<UserInfo>('/auth/profile', patch)
  const cached = getCurrentUser()
  if (cached) {
    const updated = { ...cached, ...data }
    localStorage.setItem('petcare_user', JSON.stringify(updated))
  }
  return data
}

export async function sendVerificationCode(phone: string): Promise<{ code?: string }> {
  return api.post<{ code?: string }>('/auth/send-code', { phone })
}

export { getToken, setToken }
