import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Packages.css'

const faqs = [
  { q: 'Can I cancel my membership?', a: 'Yes, memberships can be cancelled with a 30-day notice period via the website or at the front desk.' },
  { q: 'Are group classes included?', a: 'Group classes are included in the Premium and Elite Athlete plans. Basic members can join for a small drop-in fee.' },
  { q: 'Do you offer annual billing?', a: 'Yes, choose annual billing at checkout to save an additional 20% compared to monthly subscriptions.' },
  { q: 'Is there a lock-in contract?', a: 'No. All plans are flexible and can be changed or cancelled at any time.' },
]

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [studentRec, setStudentRec] = useState(null)
  const [form, setForm] = useState({ studentId: '', university: '' })
  const [verifyMsg, setVerifyMsg] = useState('')
  const [verifyErr, setVerifyErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isStudent = !!profile?.is_student_verified

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
          .from('packages')
          .select('*, package_features ( feature_description )')
          .eq('is_active', true)
          .order('sort_order')
      if (error) setError(error.message)
      setPackages(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadStudent() {
      if (!user) { setStudentRec(null); return }
      const { data } = await supabase
          .from('student_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .maybeSingle()
      setStudentRec(data)
    }
    loadStudent()
  }, [user])

  const handleSelect = (pkg) => {
    if (!user) { navigate('/login'); return }
    navigate('/billing', { state: { pkg } })
  }

  const submitVerification = async (e) => {
    e.preventDefault()
    setVerifyErr('')
    setVerifyMsg('')
    setSubmitting(true)
    const { error } = await supabase.from('student_profiles').insert([{
      user_id: user.id,
      student_id_number: form.studentId,
      university_name: form.university,
      verification_status: 'pending',
    }])
    setSubmitting(false)
    if (error) {
      setVerifyErr(error.code === '23505' ? 'You have already submitted a request.' : error.message)
      return
    }
    setStudentRec({ verification_status: 'pending' })
    setVerifyMsg('Request submitted. An admin will review it shortly.')
  }

  return (
      <div className="packages-page">
        <div className="packages-hero">
          <span className="eyebrow">Membership</span>
          <h1>Membership Packages</h1>
          <p>Choose the membership that fits your fitness goals. Flexible plans for individuals and professional athletes.</p>
        </div>

        {error && <p className="page-error">{error}</p>}

        {loading ? (
            <p className="page-loading">Loading packages...</p>
        ) : (
            <div className="packages-grid">
              {packages.map((pkg) => (
                  <div key={pkg.id} className={`package-card ${pkg.is_popular ? 'package-card--featured' : ''}`}>
                    {pkg.is_popular && <span className="package-badge">MOST POPULAR</span>}
                    <span className="package-tier">{pkg.name}</span>
                    <div className="package-price">
                      <div className="price-row">
                        <span className="price-amount">R{isStudent ? pkg.price_student : pkg.price_regular}</span>
                        <span className="price-period">/{pkg.billing_period || 'month'}</span>
                      </div>
                      <p className="price-original">
                        {isStudent
                            ? `Student rate applied (regular R${pkg.price_regular})`
                            : `Student rate: R${pkg.price_student}/${pkg.billing_period || 'month'}`}
                      </p>
                    </div>
                    <ul className="package-features">
                      {(pkg.package_features || []).map((f, j) => (
                          <li key={j}><span className="feature-check">✓</span> {f.feature_description}</li>
                      ))}
                    </ul>
                    <button
                        onClick={() => handleSelect(pkg)}
                        className={`package-btn ${pkg.is_popular ? 'package-btn--primary' : 'package-btn--secondary'}`}
                    >
                      {user ? 'Choose Plan' : 'Sign In to Join'}
                    </button>
                  </div>
              ))}
            </div>
        )}

        <div className="verification-section">
          <div className="verification-info">
            <span className="eyebrow">Students</span>
            <h2>Student discount</h2>
            <p>Verified students get a reduced monthly rate on every plan.</p>
          </div>

          {!user ? (
              <p className="verify-note">Log in to request student verification.</p>
          ) : isStudent ? (
              <div className="verified-badge"><span>✓</span> Your student status is verified.</div>
          ) : studentRec ? (
              <p className="verify-note">Verification status: <strong>{studentRec.verification_status}</strong>. An admin will review your request.</p>
          ) : (
              <form className="verification-form" onSubmit={submitVerification}>
                <label>Student number</label>
                <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required />
                <label>University</label>
                <input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} required />
                {verifyErr && <p className="verify-error">{verifyErr}</p>}
                {verifyMsg && <p className="verify-success">{verifyMsg}</p>}
                <button className="btn primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Verification'}
                </button>
              </form>
          )}
        </div>

        <div className="faq-section">
          <span className="eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: '0.5rem' }}>FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <p className="faq-question">{faq.q}</p>
                  <p className="faq-answer">{faq.a}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
  )
}