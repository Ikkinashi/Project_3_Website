import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Billing.css'

export default function Billing() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const pkg = state?.pkg
  const isStudent = state?.isStudent

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [form, setForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    street: '',
    city: '',
    zip: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!pkg) {
    navigate('/packages')
    return null
  }

  const finalPrice = isStudent ? pkg.price_student : pkg.price_regular
  const discount = isStudent ? pkg.price_regular - pkg.price_student : 0

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validateCard = () => {
    if (paymentMethod === 'card') {
      if (!form.cardholderName || !form.cardNumber || !form.expiry || !form.cvv) {
        setError('Please fill in all card details.')
        return false
      }
      if (form.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.')
        return false
      }
      if (form.cvv.length < 3) {
        setError('Please enter a valid CVV.')
        return false
      }
    }
    if (!form.street || !form.city || !form.zip) {
      setError('Please fill in your billing address.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validateCard()) return

    setLoading(true)

    if (!user) {
      setError('You must be logged in to complete a purchase.')
      setLoading(false)
      return
    }

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      package_id: pkg.id,
      amount_paid: finalPrice,
      discount_applied: isStudent,
      status: 'completed',
      payment_method: paymentMethod,
      billing_street: form.street,
      billing_city: form.city,
      billing_zip: form.zip,
    })

    if (txError) {
      setError('Payment failed. Please try again.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => navigate('/packages'), 3000)
  }

  if (success) {
    return (
      <div className="billing-page">
        <div className="billing-success">
          <div className="success-icon">✓</div>
          <h1>Enrollment Complete</h1>
          <p>Welcome to {pkg.name}. Your membership is now active.</p>
          <p className="success-redirect">Redirecting you back to packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="billing-page">

      <div className="billing-header">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Complete Your Enrollment</h1>
          <p>Secure your {pkg.name} membership and start your fitness journey.</p>
        </div>
        <div className="billing-pkg-summary">
          <span className="billing-pkg-name">{pkg.name}</span>
          <span className="billing-pkg-price">R{finalPrice}/mo</span>
          {isStudent && <span className="billing-student-tag">Student Rate</span>}
        </div>
      </div>

      <div className="billing-layout">

        <div className="billing-left">

          <div className="billing-card">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <span className="method-icon">💳</span>
                <div>
                  <p className="method-title">Credit / Debit Card</p>
                  <p className="method-desc">Visa, Mastercard, Amex</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`payment-method-btn ${paymentMethod === 'wallet' ? 'active' : ''}`}
              >
                <span className="method-icon">📱</span>
                <div>
                  <p className="method-title">Digital Wallet</p>
                  <p className="method-desc">Apple Pay, Google Pay</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="card-fields">
                <div className="field-group">
                  <label>Cardholder Name</label>
                  <input name="cardholderName" value={form.cardholderName} onChange={handleChange} placeholder="Alex Forge" />
                </div>
                <div className="field-group">
                  <label>Card Number</label>
                  <input
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                      const formatted = val.replace(/(.{4})/g, '$1 ').trim()
                      setForm({ ...form, cardNumber: formatted })
                    }}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Expiry Date</label>
                    <input
                      name="expiry"
                      value={form.expiry}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        const formatted = val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val
                        setForm({ ...form, expiry: formatted })
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="field-group">
                    <label>CVV</label>
                    <input
                      name="cvv"
                      value={form.cvv}
                      onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="wallet-placeholder">
                <p>You will be redirected to your digital wallet provider to complete payment.</p>
              </div>
            )}
          </div>

          <div className="billing-card">
            <h2>Billing Address</h2>
            <div className="card-fields">
              <div className="field-group">
                <label>Street Address</label>
                <input name="street" value={form.street} onChange={handleChange} placeholder="123 Strength Street" />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Cape Town" />
                </div>
                <div className="field-group">
                  <label>Zip Code</label>
                  <input name="zip" value={form.zip} onChange={handleChange} placeholder="7764" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="billing-right">
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-item">
              <div>
                <p className="summary-pkg-name">{pkg.name} Membership</p>
                <p className="summary-pkg-sub">Monthly subscription</p>
              </div>
              <p className="summary-pkg-price">R{pkg.price_regular}.00</p>
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <p>Subtotal</p>
                <p>R{pkg.price_regular}.00</p>
              </div>
              {isStudent && (
                <div className="summary-row summary-row--discount">
                  <p>Student Discount</p>
                  <p>− R{discount}.00</p>
                </div>
              )}
              <div className="summary-row summary-row--muted">
                <p>Tax (0%)</p>
                <p>R0.00</p>
              </div>
            </div>

            <div className="summary-total">
              <div className="total-row">
                <p className="total-label">Total</p>
                <p className="total-amount">R{finalPrice}.00</p>
              </div>
              {isStudent && <p className="total-original">Saving R{discount}.00/mo on student rate</p>}
            </div>

            {error && <p className="billing-error">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn primary enroll-btn"
            >
              {loading ? 'Processing...' : `Pay R${finalPrice}.00`}
            </button>

            <p className="security-note">🔒 Secured by AES-256 Encryption</p>
          </div>
        </div>

      </div>
    </div>
  )
}