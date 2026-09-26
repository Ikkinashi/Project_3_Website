import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'
import '../styles/Profile.css'

function Profile() {
    const { user, profile, loading: authLoading } = useAuth()
    const [tab, setTab] = useState('overview')

    if (authLoading) return <div className="page-loading">Loading profile...</div>

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="page-hero">
                    <span className="eyebrow">Account</span>
                    <h1>Profile Not Found</h1>
                    <p>Your account exists, but your profile data is missing from the database. If this is an older test account, please delete it and sign up again.</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        ...(profile.role === 'member' ? [
            { key: 'bookings', label: 'My Bookings' },
            { key: 'billing', label: 'Billing' },
        ] : []),
        { key: 'contact', label: 'Contact Support' },
    ]

    return (
        <div className="profile-page">
            <div className="page-hero profile-hero">
                <div className="profile-avatar">
                    {(profile.full_name || profile.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                    <span className="eyebrow">Account</span>
                    <h1>{profile.full_name || 'My Profile'}</h1>
                    <p>{profile.email} <span className="role-pill inline-pill">{profile.role}</span></p>
                </div>
            </div>

            <div className="profile-tabs">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={`profile-tab ${tab === t.key ? 'active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="profile-tab-content">
                {tab === 'overview' && <OverviewTab profile={profile} />}
                {tab === 'bookings' && <BookingsTab user={user} />}
                {tab === 'billing' && <BillingTab user={user} />}
                {tab === 'contact' && <ContactTab profile={profile} />}
            </div>
        </div>
    )
}

function OverviewTab({ profile }) {
    return (
        <div className="profile-card">
            <h3>Account Details</h3>
            <div className="detail-grid">
                <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{profile.full_name || '—'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{profile.role}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function BookingsTab({ user }) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from('course_bookings')
                .select('id, status, booked_at, courses ( id, name, description )')
                .eq('user_id', user.id)
                .eq('status', 'confirmed')
                .order('booked_at', { ascending: false })

            if (error) setError(error.message)
            else setBookings(data)
            setLoading(false)
        }
        if (user) load()
    }, [user])

    async function handleCancel(bookingId) {
        const { error } = await supabase.from('course_bookings').delete().eq('id', bookingId)
        if (error) { setError(error.message); return }
        setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    }

    if (loading) return <p>Loading your bookings...</p>
    if (error) return <p className="page-error">{error}</p>

    return (
        <div className="profile-card">
            <h3>My Bookings</h3>
            {bookings.length === 0 ? (
                <p>You haven't booked any classes yet. <a href="/courses">Browse courses</a>.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map((b) => (
                        <div key={b.id} className="booking-row">
                            <div>
                                <strong>{b.courses?.name}</strong>
                                <p>{b.courses?.description}</p>
                                <span className="detail-label">Booked {new Date(b.booked_at).toLocaleDateString()}</span>
                            </div>
                            <button className="btn secondary" onClick={() => handleCancel(b.id)}>Cancel</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function BillingTab({ user }) {
    const [subscription, setSubscription] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            const [subResult, invoiceResult] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('*, packages ( name, price, billing_period )')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle(),
                supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
            ])

            if (subResult.error) setError(subResult.error.message)
            else setSubscription(subResult.data)

            if (invoiceResult.data) setInvoices(invoiceResult.data)
            setLoading(false)
        }
        if (user) load()
    }, [user])

    if (loading) return <p>Loading billing info...</p>
    if (error) return <p className="page-error">{error}</p>

    return (
        <>
            <div className="profile-card">
                <h3>Current Plan</h3>
                {subscription ? (
                    <div className="plan-summary">
                        <h4>{subscription.packages?.name}</h4>
                        <p>R{subscription.packages?.price} / {subscription.packages?.billing_period}</p>
                        <p>Status: {subscription.status}</p>
                        <p>Renews: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <p>You don't have an active subscription. <a href="/packages">View packages</a>.</p>
                )}
            </div>

            <div className="profile-card">
                <h3>Invoice History</h3>
                {invoices.length === 0 ? (
                    <p>No invoices yet.</p>
                ) : (
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Date</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                <td>R{inv.amount}</td>
                                <td>{inv.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    )
}

function ContactTab({ profile }) {
    const [name, setName] = useState(profile.full_name || '')
    const [email, setEmail] = useState(profile.email || '')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const { error } = await supabase.from('contact_messages').insert([{ name, email, message }])

        setSubmitting(false)

        if (error) { setError(error.message); return }

        setSuccess(true)
        setMessage('')
    }

    return (
        <div className="profile-card">
            <h3>Contact Support</h3>
            <p>Have a question about your account, billing, or a class? Send us a message.</p>

            <form className="contact-form" onSubmit={handleSubmit}>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">Message sent! We'll get back to you soon.</p>}

                <label>
                    Name
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label>
                    Message
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
                </label>

                <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    )
}

export default Profile