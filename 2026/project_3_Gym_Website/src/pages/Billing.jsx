import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function Billing() {
  const { state } = useLocation()
  const navigate = useNavigate()

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

  // Billing can only be accessed after a package has been selected.
  if (!pkg) {
    navigate('/packages')
    return null
  }

  const finalPrice = isStudent ? pkg.price_student : pkg.price_regular
  const discount = isStudent ? pkg.price_regular - pkg.price_student : 0

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to complete a purchase.')
      setLoading(false)
      return
    }

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        amount_paid: finalPrice,
        discount_applied: isStudent,
        status: 'completed',
        payment_method: paymentMethod,
        billing_street: form.street,
        billing_city: form.city,
        billing_zip: form.zip
      })

    if (txError) {
      setError('Payment failed. Please try again.')
    } else {
      navigate('/packages')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-tertiary text-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-4 border-b border-neutral">
        <span className="text-primary font-bold text-xl">
          Forge Fitness
        </span>

        <div className="flex gap-8 text-secondary text-sm">
          <a href="#" className="hover:text-white">
            Home
          </a>

          <a href="#" className="hover:text-white">
            About
          </a>

          <a href="#" className="hover:text-white">
            Classes
          </a>

          <a href="#" className="hover:text-white">
            Trainers
          </a>

          <a
            href="/packages"
            className="text-white border-b-2 border-primary pb-1"
          >
            Subscription
          </a>

          <a href="#" className="hover:text-white">
            Profile
          </a>
        </div>

        <div className="w-8 h-8 rounded-full bg-neutral" />
      </nav>

      <div className="px-10 py-8 flex gap-8 flex-wrap">

        {/* Left Side */}
        <div className="flex-1 min-w-80 flex flex-col gap-6">

          <div>
            <h1 className="text-2xl font-bold">
              Checkout
            </h1>

            <p className="text-secondary text-sm">
              Complete your membership enrollment to access all gym facilities.
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-neutral rounded-2xl p-6">

            <h2 className="font-semibold mb-4">
              Payment Method
            </h2>

            <div className="flex gap-4 mb-6">

              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 border rounded-xl p-4 text-sm text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary'
                    : 'border-neutral'
                }`}
              >
                <p className="font-semibold">
                  Credit / Debit Card
                </p>

                <p className="text-secondary text-xs mt-1">
                  Complete your membership enrollment to access all gym facilities.
                </p>
              </button>

              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`flex-1 border rounded-xl p-4 text-sm text-left transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-primary'
                    : 'border-neutral'
                }`}
              >
                <p className="font-semibold">
                  Digital Wallet
                </p>

                <p className="text-secondary text-xs mt-1">
                  Complete your membership enrollment to access all gym facilities.
                </p>
              </button>

            </div>

            {/* Card Fields */}
            {paymentMethod === 'card' && (
              <div className="flex flex-col gap-4">

                <div>
                  <label className="text-sm text-secondary mb-1 block">
                    Cardholder Name
                  </label>

                  <input
                    name="cardholderName"
                    value={form.cardholderName}
                    onChange={handleChange}
                    placeholder="Alex Forge"
                    className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary mb-1 block">
                    Card Number
                  </label>

                  <input
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-4">

                  <div className="flex-1">
                    <label className="text-sm text-secondary mb-1 block">
                      Expiry Date
                    </label>

                    <input
                      name="expiry"
                      value={form.expiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-sm text-secondary mb-1 block">
                      CVV
                    </label>

                    <input
                      name="cvv"
                      value={form.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                    />
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Billing Address */}
          <div className="bg-neutral rounded-2xl p-6">

            <h2 className="font-semibold mb-4">
              Billing Address
            </h2>

            <div className="flex flex-col gap-4">

              <div>
                <label className="text-sm text-secondary mb-1 block">
                  Street Address
                </label>

                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="123 Strength Street"
                  className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-4">

                <div className="flex-1">
                  <label className="text-sm text-secondary mb-1 block">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Cape Town"
                    className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-sm text-secondary mb-1 block">
                    Zip Code
                  </label>

                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="7764"
                    className="w-full bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Right Side - Order Summary */}
        <div className="w-80 flex flex-col gap-4">

          <div className="bg-neutral rounded-2xl p-6 flex flex-col gap-4">

            <h2 className="font-semibold">
              Order Summary
            </h2>

            <div className="flex justify-between text-sm">

              <div>
                <p className="font-semibold">
                  R{pkg.price_regular}.00
                </p>

                <p className="text-secondary">
                  {pkg.name} Monthly Membership
                </p>
              </div>

              <p>
                R{pkg.price_regular}.00
              </p>

            </div>

            <div className="border-t border-tertiary pt-4 flex flex-col gap-2 text-sm">

              <div className="flex justify-between">
                <p className="text-secondary">
                  Subtotal
                </p>

                <p>
                  R{pkg.price_regular}.00
                </p>
              </div>

              {isStudent && (
                <div className="flex justify-between text-primary">

                  <p>
                    Student Discount
                  </p>

                  <p>
                    - R{discount}.00
                  </p>

                </div>
              )}

              <div className="flex justify-between text-secondary">

                <p>
                  Tax (0%)
                </p>

                <p>
                  R0.00
                </p>

              </div>
            </div>

            <div className="border-t border-tertiary pt-4">

              <p className="text-secondary text-xs mb-2">
                Complete your membership enrollment to access all gym facilities.
              </p>

              <p className="text-3xl font-bold">
                R {finalPrice}
              </p>

              {isStudent && (
                <p className="text-secondary text-xs line-through">
                  R{pkg.price_regular}
                </p>
              )}

            </div>

            {error && (
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-black font-semibold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : 'Complete Enrollment'}
            </button>

            <p className="text-secondary text-xs text-center">
              Secured by AES-256 Encryption
            </p>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-neutral px-10 py-6 flex justify-between text-secondary text-xs mt-8">

        <div>
          <p className="text-white font-bold">
            Forge Fitness Inc.
          </p>

          <p>
            © 2024 Forge Fitness Inc. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6">

          <a href="#" className="hover:text-white">
            Help
          </a>

          <a href="#" className="hover:text-white">
            Terms
          </a>

          <a href="#" className="hover:text-white">
            Privacy
          </a>

        </div>

      </footer>

    </div>
  )
}