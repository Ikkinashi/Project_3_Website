import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Packages.css'

const faqs = [
  { q: 'Can I cancel my membership?', a: 'Yes, memberships can be cancelled with a 30-day notice period via the website or at the front desk.' },
  { q: 'Are group classes included?', a: 'Group classes are included in the Premium and Elite Athlete plans. Basic members can join for a small drop-in fee.' },
  { q: 'How do student discounts work?', a: 'Once verified, your billing will automatically apply a discount to your monthly subscription.' },
  { q: 'Do you offer annual billing?', a: 'Yes, choose annual billing at checkout to save an additional 20% compared to monthly subscriptions.' },
]

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [features, setFeatures] = useState({})
  const [isStudent, setIsStudent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyInstitution, setVerifyInstitution] = useState('')
  const [verifyStudentId, setVerifyStudentId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState('')
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const { data: pkgs } = await supabase.from('packages').select('*').eq('is_active', true)
      const { data: feats } = await supabase.from('package_features').select('*')

      if (profile?.is_student_verified) setIsStudent(true)

      const featMap = {}
      feats?.forEach(f => {
        if (!featMap[f.package_id]) featMap[f.package_id] = []
        featMap[f.package_id].push(f.feature_description)
      })

      setPackages(pkgs || [])
      setFeatures(featMap)
      setLoading(false)
    }
    fetchData()
  }, [profile])

  const handleSelect = (pkg) => {
    if (!user) { navigate('/login'); return }
    navigate('/billing', { state: { pkg, isStudent } })
  }

  const handleVerify = async () => {
    if (!user) { navigate('/login'); return }
    if (!verifyEmail || !verifyInstitution || !verifyStudentId) {
      setVerifyMessage('Please fill in all fields.')
      return
    }
    setVerifying(true)
    setVerifyMessage('')

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_student_verified: true })
      .eq('id', user.id)

    const { error: studentError } = await supabase
      .from('student_profiles')
      .upsert({
        user_id: user.id,
        student_id_number: verifyStudentId,
        university_name: verifyInstitution,
        verification_status: 'verified'
      })

    if (profileError || studentError) {
      setVerifyMessage('Verification failed. Please try again.')
    } else {
      setIsStudent(true)
      setVerifyMessage('Student status verified! Student pricing is now active.')
      await refreshProfile()
    }
    setVerifying(false)
  }

  return (
    <div className="packages-page">

      <div className="packages-hero">
        <span className="eyebrow">Membership</span>
        <h1>Membership Packages</h1>
        <p>Choose the membership that fits your fitness goals. We offer flexible plans for individuals, students, and professional athletes.</p>
        <div className="pricing-toggle">
          <button
            onClick={() => setIsStudent(false)}
            className={`toggle-btn ${!isStudent ? 'active' : ''}`}
          >
            Regular Pricing
          </button>
          <button
            onClick={() => setIsStudent(true)}
            className={`toggle-btn ${isStudent ? 'active' : ''}`}
            disabled={!isStudent && !profile?.is_student_verified}
            title={!isStudent && !profile?.is_student_verified ? 'Verify your student status below to unlock student pricing' : ''}
          >
            Student Discount
          </button>
        </div>
      </div>

      {loading ? (
        <p className="page-loading">Loading packages...</p>
      ) : (
        <div className="packages-grid">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={`package-card ${i === 1 ? 'package-card--featured' : ''}`}>
              {i === 1 && <span className="package-badge">MOST POPULAR</span>}
              <span className="package-tier">{pkg.name}</span>
              <div className="package-price">
                <div className="price-row">
                  <span className="price-amount">R{isStudent ? pkg.price_student : pkg.price_regular}</span>
                  <span className="price-period">/mo</span>
                </div>
                {isStudent && <p className="price-original">R{pkg.price_regular}/mo regular</p>}
              </div>
              <ul className="package-features">
                {(features[pkg.id] || []).map((f, j) => (
                  <li key={j}><span className="feature-check">✓</span> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(pkg)}
                className={`package-btn ${i === 1 ? 'package-btn--primary' : 'package-btn--secondary'}`}
              >
                {!user ? 'Sign In to Join' : i === 0 ? 'Current Plan' : i === 1 ? 'Upgrade to Pro' : 'Contact Sales'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="verification-section">
        <div className="verification-info">
          <span className="eyebrow">Students</span>
          <h2>Student Membership Verification</h2>
          <p>Verify your student status to unlock discounted prices for all membership tiers. Get fit while you study at any accredited institution.</p>
          <div className="verification-cards">
            <div className="verification-card">
              <span className="verification-icon">WHENEVER YOU NEED</span>
              <p className="verification-card-title">Instant Approval</p>
              <p>Verify with your university email or student ID card.</p>
            </div>
            <div className="verification-card">
              <span className="verification-icon">EVERY TIME, ALL THE TIME</span>
              <p className="verification-card-title">Renewable Yearly</p>
              <p>Renewal required every 12 months with valid proof.</p>
            </div>
          </div>
        </div>
        <div className="verification-form">
          {isStudent ? (
            <div className="verified-badge">
              <span>✓</span>
              <p>Student status verified. Student pricing is active.</p>
            </div>
          ) : (
            <>
              <label>Student Email</label>
              <input type="email" placeholder="you@university.edu" value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} />
              <label>Student ID Number</label>
              <input type="text" placeholder="230270565" value={verifyStudentId} onChange={e => setVerifyStudentId(e.target.value)} />
              <label>Institution Name</label>
              <input type="text" placeholder="Cape Peninsula University of Technology" value={verifyInstitution} onChange={e => setVerifyInstitution(e.target.value)} />
              {verifyMessage && (
                <p className={verifyMessage.includes('verified') ? 'verify-success' : 'verify-error'}>{verifyMessage}</p>
              )}
              <button className="btn primary" onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify Status'}
              </button>
              {!user && <p className="verify-note">You must be signed in to verify your student status.</p>}
            </>
          )}
        </div>
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