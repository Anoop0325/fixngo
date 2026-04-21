
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Spinner from '@/components/ui/Spinner'

export default function RoleRoute({ children, roles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles.length > 0 && !roles.includes(user?.role)) {
    
    const fallback = user?.role === 'provider' ? '/provider/dashboard' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}
