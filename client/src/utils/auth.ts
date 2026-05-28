export function isLoggedIn(): boolean {
  return localStorage.getItem('petcare_token') !== null
}

export function login(token: string) {
  localStorage.setItem('petcare_token', token)
}

export function logout() {
  localStorage.removeItem('petcare_token')
}
