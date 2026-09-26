import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'
import '../styles/Auth.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const { data, error } = await signIn(email, password)

        if (error) {
            setSubmitting(false)
            setError(error.message)
            return
        }

        const userId = data?.user?.id
        let role = 'member'

        if (userId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (profile?.role) role = profile.role
        }

        setSubmitting(false)

        if (role === 'admin') navigate('/admin-dashboard')
        else if (role === 'trainer') navigate('/trainer-dashboard')
        else navigate('/')
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-brand">
                    <div className="brand-label">FORGE FITNESS</div>
                    <h1>
                        FORGE YOUR
                        <span>STRONGER SELF.</span>
                    </h1>
                    <p>
                        Train harder. Recover smarter.
                        Build the version of yourself you've always wanted.
                    </p>
                    <div className="brand-line" />
                    <small>PERFORMANCE • DISCIPLINE • PROGRESS</small>
                </div>

                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-overline">MEMBER ACCESS</span>
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue your Forge journey.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <p className="auth-error">{error}</p>}

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
                            <div className="password-label">
                                <label htmlFor="password">Password</label>
                                <a href="#">Forgot password?</a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={submitting}>
                            {submitting ? 'LOGGING IN...' : 'LOGIN'}
                            {!submitting && <span>→</span>}
                        </button>
                    </form>

                    <div className="auth-switch">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login