import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

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
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      await supabase.auth.signInWithPassword({
      email: 'student@forgefitness.com',
      password: 'Test@1234'
      })
    const { data: pkgs } = await supabase.from('packages').select('*').eq('is_active', true)
    const { data: feats } = await supabase.from('package_features').select('*')
    const { data: { user } } = await supabase.auth.getUser()


      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_student_verified').eq('id', user.id).single()
        if (profile?.is_student_verified) setIsStudent(true)
      }

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
  }, [])

  const handleSelect = (pkg) => {
    navigate('/billing', { state: { pkg, isStudent } })
  }

  return (
    <div className="min-h-screen bg-tertiary text-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-4 border-b border-neutral">
        <span className="text-primary font-bold text-xl">Forge Fitness</span>
        <div className="flex gap-8 text-secondary text-sm">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Classes</a>
          <a href="#" className="hover:text-white">Trainers</a>
          <a href="/packages" className="text-white border-b-2 border-primary pb-1">Subscription</a>
          <a href="#" className="hover:text-white">Profile</a>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral" />
      </nav>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl font-bold mb-3">Membership Packages</h1>
        <p className="text-secondary max-w-lg mx-auto">Choose the membership that fits your fitness goals. We offer flexible plans for individuals, students, and professional athletes.</p>
        <div className="flex justify-center mt-6">
          <div className="flex bg-neutral rounded-full p-1">
            <button onClick={() => setIsStudent(false)} className={`px-5 py-2 rounded-full text-sm transition-all ${!isStudent ? 'bg-white text-black' : 'text-secondary'}`}>Regular Pricing</button>
            <button onClick={() => setIsStudent(true)} className={`px-5 py-2 rounded-full text-sm transition-all ${isStudent ? 'bg-white text-black' : 'text-secondary'}`}>Student Discount</button>
          </div>
        </div>
      </div>

      {/* Package Cards */}
      {loading ? (
        <p className="text-center text-secondary">Loading packages...</p>
      ) : (
        <div className="flex justify-center gap-6 px-10 pb-12 flex-wrap">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={`bg-neutral rounded-2xl p-6 w-72 flex flex-col gap-4 relative ${i === 1 ? 'border-2 border-primary' : ''}`}>
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
              )}
              <span className="text-xs bg-tertiary text-secondary px-2 py-1 rounded-full w-fit">{pkg.name}</span>
              <div>
                <span className="text-4xl font-bold">R{isStudent ? pkg.price_student : pkg.price_regular}</span>
                <span className="text-secondary text-sm">/mo</span>
                {isStudent && <p className="text-primary text-xs mt-1">R{pkg.price_regular}/mo regular price</p>}
              </div>
              <ul className="flex flex-col gap-2 flex-1">
                {(features[pkg.id] || []).map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-secondary">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(pkg)}
                className={`mt-4 py-3 rounded-xl text-sm font-semibold transition-all ${i === 1 ? 'bg-primary text-black hover:opacity-90' : 'border border-secondary text-white hover:border-primary'}`}
              >
                {i === 0 ? 'Current Plan' : i === 1 ? 'Upgrade to Pro' : 'Contact Sales'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Student Verification */}
      <div className="mx-10 mb-12 bg-neutral rounded-2xl p-8 flex gap-8 flex-wrap">
        <div className="flex-1 min-w-60">
          <h2 className="text-2xl font-bold mb-3">Student Membership Verification</h2>
          <p className="text-secondary text-sm mb-6">Verify your student status to unlock discounted prices for all membership tiers.</p>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-tertiary rounded-xl p-4 flex-1 min-w-40">
              <p className="font-semibold text-sm mb-1">Instant Approval</p>
              <p className="text-secondary text-xs">Verify with your university email or student ID card.</p>
            </div>
            <div className="bg-tertiary rounded-xl p-4 flex-1 min-w-40">
              <p className="font-semibold text-sm mb-1">Renewable Yearly</p>
              <p className="text-secondary text-xs">Renewal required every 12 months with valid proof.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-64">
          <label className="text-sm text-secondary">Student Email</label>
          <input className="bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary" placeholder="you@university.edu" />
          <label className="text-sm text-secondary">Institution Name</label>
          <input className="bg-tertiary border border-neutral rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary" placeholder="State University" />
          <button className="bg-primary text-black font-semibold py-2 rounded-lg text-sm hover:opacity-90 mt-2">Verify Status</button>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-10 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-neutral pb-4">
              <p className="font-semibold text-sm mb-1">{faq.q}</p>
              <p className="text-secondary text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral px-10 py-6 flex justify-between text-secondary text-xs">
        <div>
          <p className="text-white font-bold">Forge Fitness Inc.</p>
          <p>© 2024 Forge Fitness Inc. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Help</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
      </footer>

    </div>
  )
}