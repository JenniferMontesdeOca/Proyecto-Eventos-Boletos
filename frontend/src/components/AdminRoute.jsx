// frontend/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { getToken } from '../api'

export default function AdminRoute({ children }) {
  const token = getToken()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // si no hay token → al login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // si hay token pero no es admin → al home
  if (!user || user.rol_id !== 3) {
    return <Navigate to="/" replace />
  }

  // es admin → puede ver el panel
  return children
}
