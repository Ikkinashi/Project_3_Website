import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../../../Project_3_Website1/2026/project_3_Gym_Website/src/context/AuthContext'
import ProtectedRoute from '../../../../Project_3_Website1/2026/project_3_Gym_Website/src/components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Courses from './pages/Courses'
import Trainers from './pages/Trainers'
import About from './pages/About'
import Packages from './pages/Packages'
import Billing from './pages/Billing'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import MyBookings from './pages/MyBookings'
import TrainerDashboard from './pages/TrainerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        setMenuOpen(false)
        navigate('/login')
    }

    return (
        <div className="app-shell">
            <header className="navbar">
                <div className="navbar-inner">
                    <NavLink to="/" className="logo-text" onClick={() => setMenuOpen(false)}>
                        Forge Fitness
                    </NavLink>

                    <button
                        className="nav-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                        <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
                        <NavLink to="/courses" onClick={() => setMenuOpen(false)}>Courses</NavLink>
                        <NavLink to="/trainers" onClick={() => setMenuOpen(false)}>Trainers</NavLink>
                        <NavLink to="/packages" onClick={() => setMenuOpen(false)}>Packages</NavLink>

                        {user && profile?.role === 'member' && (
                            <>
                                <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</NavLink>
                                <NavLink to="/billing" onClick={() => setMenuOpen(false)}>Billing</NavLink>
                            </>
                        )}

                        {user && (
                            <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
                        )}

                        {user && profile?.role === 'trainer' && (
                            <NavLink to="/trainer-dashboard" onClick={() => setMenuOpen(false)}>Trainer Dashboard</NavLink>
                        )}

                        {user && profile?.role === 'admin' && (
                            <NavLink to="/admin-dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</NavLink>
                        )}

                        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>

                        <div className="navbar-auth">
                            {user ? (
                                <>
                                    <span className="signed-in-as">
                                        {profile?.full_name || profile?.email} ({profile?.role})
                                    </span>
                                    <button className="signout-btn" onClick={handleSignOut}>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <NavLink to="/login" className="btn primary nav-login-btn" onClick={() => setMenuOpen(false)}>
                                    Log In
                                </NavLink>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            <main className="page-content">{children}</main>
        </div>
    )
}

function AppRoutes() {
    const { loading } = useAuth()

    if (loading) {
        return <div className="page-loading">Loading...</div>
    }

    return (
        <Layout>
            <Routes>
                {/* Public & Member Shared Website Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected General User/Staff Routes */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/billing"
                    element={
                        <ProtectedRoute allowedRoles={['member']}>
                            <Billing />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-bookings"
                    element={
                        <ProtectedRoute allowedRoles={['member']}>
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />

                {/* Trainer Dashboard Route */}
                <Route
                    path="/trainer-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard Route */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Legacy redirect fallback */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App