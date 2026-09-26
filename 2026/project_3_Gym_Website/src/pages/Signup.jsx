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

        // If email confirmation is on (default in Supabase), the user
        // needs to confirm before they can log in.
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
    }

    // Note: every new signup gets role = 'member' by default (set in the DB trigger).
    // To create trainer/admin accounts, sign up normally then update the role
    // in the Supabase Table Editor, or build an admin-only "promote user" screen.

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>

                {error && <p className="auth-error">{error}</p>}
                {success && (
                    <p className="auth-success">
                        Account created! Check your email to confirm, then log in.
                    </p>
                )}

                <label>
                    Full Name
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </label>

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
                        minLength={6}
                        required
                    />
                </label>

                <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Sign Up'}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    )
}

export default Signup