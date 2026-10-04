import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

function Signup() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const { error } = await signUp(email, password, fullName)

        setSubmitting(false)

        if (error) {
            setError(error.message)
            return
        }

        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-brand">
                    <div className="brand-label">FORGE FITNESS</div>
                    <h1>
                        START YOUR
                        <span>TRANSFORMATION.</span>
                    </h1>
                    <p>
                        Join a community built on discipline, progress, and
                        results. Your first step starts here.
                    </p>
                    <div className="brand-line" />
                    <small>PERFORMANCE • DISCIPLINE • PROGRESS</small>
                </div>

                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-overline">NEW MEMBER</span>
                        <h2>Create Account</h2>
                        <p>Sign up to start training with Forge Fitness.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <p className="auth-error">{error}</p>}
                        {success && (
                            <p className="auth-success">
                                Account created! Check your email to confirm, then log in.
                            </p>
                        )}

                        <div className="input-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={submitting}>
                            {submitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                            {!submitting && <span>→</span>}
                        </button>
                    </form>

                    <div className="auth-switch">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup