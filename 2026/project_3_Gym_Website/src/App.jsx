import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
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

    const close = () => setMenuOpen(false)

    return (
        <div className="app-shell">
            <header className="navbar">
                <div className="navbar-inner">
                    <NavLink to="/" className="logo" onClick={close}>
                        <span className="logo-mark">F</span>
                        <span className="logo-text">Forge Fitness</span>
                    </NavLink>

                    <button
                        className={`nav-toggle ${menuOpen ? 'active' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span><span></span><span></span>
                    </button>

                    <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                        <NavLink to="/" onClick={close} end>Home</NavLink>
                        <NavLink to="/about" onClick={close}>About</NavLink>
                        <NavLink to="/courses" onClick={close}>Courses</NavLink>
                        <NavLink to="/trainers" onClick={close}>Trainers</NavLink>
                        <NavLink to="/packages" onClick={close}>Packages</NavLink>

                        {user && <NavLink to="/profile" onClick={close}>Profile</NavLink>}

                        {user && profile?.role === 'trainer' && (
                            <NavLink to="/trainer-dashboard" onClick={close}>Trainer Dashboard</NavLink>
                        )}

                        {user && profile?.role === 'admin' && (
                            <NavLink to="/admin-dashboard" onClick={close}>Admin Dashboard</NavLink>
                        )}

                        <div className="navbar-auth">
                            {user ? (
                                <>
                                    <span className="signed-in-as">
                                        {profile?.full_name || profile?.email}
                                        <span className="role-pill">{profile?.role}</span>
                                    </span>
                                    <button className="signout-btn" onClick={handleSignOut}>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <NavLink to="/login" className="btn primary nav-login-btn" onClick={close}>
                                    Log In
                                </NavLink>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            <main className="page-content">{children}</main>

            <footer className="site-footer">
                <div className="footer-inner">
                    <span>© {new Date().getFullYear()} Forge Fitness. All rights reserved.</span>
                    <div className="footer-links">
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/packages">Packages</NavLink>
                    </div>
                </div>
            </footer>
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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/contact" element={<Contact />} />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Kept for direct-link backward compatibility; not in navbar */}
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

                <Route
                    path="/trainer-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

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