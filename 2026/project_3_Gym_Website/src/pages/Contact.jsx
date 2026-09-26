import { useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Contact.css'

function Contact() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const { error } = await supabase
            .from('contact_messages')
            .insert([{ name, email, message }])

        setSubmitting(false)

        if (error) {
            setError(error.message)
            return
        }

        setSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
    }

    return (
        <div className="contact-page">
            <h1>Contact Us</h1>

            <form className="contact-form" onSubmit={handleSubmit}>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">Message sent! We'll get back to you soon.</p>}

                <label>
                    Name
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                    Message
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        required
                    />
                </label>

                <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    )
}

export default Contact