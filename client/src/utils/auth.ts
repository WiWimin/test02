export type UserRole = 'owner' | 'sitter' | 'admin'

export interface UserInfo {
  id: string
  name: string
  phone: string
  role: UserRole
  avatar: string
}

const USER_KEY = 'petcare_user'
const TOKEN_KEY = 'petcare_token'

export function isLoggedIn(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null
}

export function login(user: UserInfo) {
  localStorage.setItem(TOKEN_KEY, 'mock-token-' + Date.now())
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getCurrentUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getUserRole(): UserRole | null {
  return getCurrentUser()?.role || null
}

export function updateUserProfile(patch: Partial<UserInfo>) {
  const user = getCurrentUser()
  if (user) {
    const updated = { ...user, ...patch }
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
  }
}
