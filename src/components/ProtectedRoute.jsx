import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying session...</p>
      </div>
    )
  }

  if (!currentUser) {
    // Redirect unauthenticated user to /login and preserve location for redirection post-login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
