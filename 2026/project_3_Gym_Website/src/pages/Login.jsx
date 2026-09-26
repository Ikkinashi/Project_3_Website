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

        // Route appropriately based on role
        if (role === 'admin') {
            navigate('/admin-dashboard')
        } else if (role === 'trainer') {
            navigate('/trainer-dashboard')
        } else {
            navigate('/')
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Log In</h2>

                {error && <p className="auth-error">{error}</p>}

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log In'}
                </button>

                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </form>
        </div>
    )
}

export default Login