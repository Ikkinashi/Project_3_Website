import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'
import { Link } from 'react-router-dom'
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
          <p>Your account exists but profile data is missing. Please sign out and sign up again.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'enrollments', label: 'My Courses' },
    { key: 'billing', label: 'Billing History' },
    { key: 'contact', label: 'Contact Support' },
  ]

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar-large">
          {(profile.full_name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="eyebrow">Account</span>
          <h1>{profile.full_name || 'My Profile'}</h1>
          <div className="profile-meta">
            <span className="role-pill">{profile.role}</span>
            {profile.is_student_verified && (
              <span className="student-verified-pill">✓ Student Verified</span>
            )}
          </div>
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
        {tab === 'enrollments' && <EnrollmentsTab user={user} />}
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
          <span className="detail-label">Role</span>
          <span className="detail-value">{profile.role}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Student Status</span>
          <span className="detail-value">
            {profile.is_student_verified ? '✓ Verified' : 'Not verified'}
          </span>
        </div>
      </div>
      {!profile.is_student_verified && (
        <div className="profile-cta">
          <p>Verify your student status to unlock discounted membership pricing.</p>
          <Link to="/packages" className="btn primary">Verify on Packages Page</Link>
        </div>
      )}
    </div>
  )
}

function EnrollmentsTab({ user }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, enrolled_at, completed_at, courses ( id, title, description, difficulty )')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (error) setError(error.message)
      else setEnrollments(data ?? [])
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <p className="page-loading">Loading your courses...</p>
  if (error) return <p className="page-error">{error}</p>

  return (
    <div className="profile-card">
      <h3>My Courses</h3>
      {enrollments.length === 0 ? (
        <div className="empty-state">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="enrollments-list">
          {enrollments.map((e) => (
            <div key={e.id} className="enrollment-row">
              <div>
                <strong>{e.courses?.title}</strong>
                <p>{e.courses?.description}</p>
                <div className="enrollment-meta">
                  <span className="detail-label">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</span>
                  {e.courses?.difficulty && (
                    <span className="tag">{e.courses.difficulty}</span>
                  )}
                </div>
              </div>
              <span className={`status-pill ${e.completed_at ? 'completed' : 'active'}`}>
                {e.completed_at ? 'Completed' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BillingTab({ user }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount_paid, discount_applied, status, payment_method, created_at, packages ( name, price_regular )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) setError(error.message)
      else setTransactions(data ?? [])
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <p className="page-loading">Loading billing history...</p>
  if (error) return <p className="page-error">{error}</p>

  const active = transactions.find(t => t.status === 'completed')

  return (
    <>
      <div className="profile-card">
        <h3>Current Plan</h3>
        {active ? (
          <div className="plan-summary">
            <div className="plan-name">{active.packages?.name}</div>
            <div className="plan-price">R{active.amount_paid}/mo</div>
            {active.discount_applied && (
              <span className="student-verified-pill">Student Rate Applied</span>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>No active membership. Browse our packages to get started.</p>
            <Link to="/packages" className="btn primary">View Packages</Link>
          </div>
        )}
      </div>

      <div className="profile-card">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.packages?.name}</td>
                  <td>R{tx.amount_paid}</td>
                  <td>{tx.discount_applied ? '✓ Student' : '—'}</td>
                  <td>{tx.payment_method}</td>
                  <td><span className={`status-pill ${tx.status}`}>{tx.status}</span></td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
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
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await supabase
      .from('contact_enquiries')
      .insert([{ name, message, status: 'new' }])

    setSubmitting(false)

    if (error) { setError(error.message); return }

    setSuccess(true)
    setMessage('')
  }

  return (
    <div className="profile-card">
      <h3>Contact Support</h3>
      <p>Have a question about your account, billing, or a class? Send us a message.</p>

      <form className="contact-form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">Message sent! We'll get back to you soon.</p>}

        <div className="field-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="field-group">
          <label>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
        </div>

        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

export default Profile