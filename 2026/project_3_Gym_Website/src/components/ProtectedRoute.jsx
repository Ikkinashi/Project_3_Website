import { Navigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, allowedRoles }) {
    const { user, role, loading } = useAuth()

    if (loading) {
        return <div className="page-loading">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute