import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const token = localStorage.getItem('petcare_token')
  if (!token) return <Navigate to="/login" replace />
  if (roles) {
    const cached = (() => { try { return JSON.parse(localStorage.getItem('petcare_user') || 'null') } catch { return null } })()
    if (!cached || !roles.includes(cached.role)) return <Navigate to="/" replace />
  }
  return children
}
