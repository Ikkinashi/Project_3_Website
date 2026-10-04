import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import '../styles/Home.css'

function Home() {
  const [stats, setStats] = useState({ members: 0, trainers: 0, classes: 0 })
  const [packages, setPackages] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [membersRes, trainersRes, classesRes, packagesRes, trainersListRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('trainers').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('packages').select('id, name, price_regular, price_student').eq('is_active', true).limit(3),
        supabase.from('trainers').select('id, name, bio').limit(3),
      ])

      setStats({
        members: membersRes.count ?? 0,
        trainers: trainersRes.count ?? 0,
        classes: classesRes.count ?? 0,
      })
      setPackages(packagesRes.data ?? [])
      setTrainers(trainersListRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-badge">Cape Town's Premier Training Facility</span>
          <h1>Forge your strongest self</h1>
          <p>Elite trainers, modern equipment, and a community that pushes you further. Whatever your goal, Forge Fitness has the program to get you there.</p>
          <div className="hero-actions">
            <Link to="/packages" className="btn primary">View Plans</Link>
            <Link to="/courses" className="btn secondary">Browse Classes</Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
            alt="Gym training session"
          />
          <div className="hero-image-overlay" />
        </div>
      </section>

      <section className="stats-bar">
        <div className="stat">
          <h2>{loading ? '—' : `${stats.members}+`}</h2>
          <p>Active Members</p>
        </div>
        <div className="stat">
          <h2>{loading ? '—' : stats.trainers}</h2>
          <p>Expert Trainers</p>
        </div>
        <div className="stat">
          <h2>{loading ? '—' : stats.classes}</h2>
          <p>Classes Offered</p>
        </div>
        <div className="stat">
          <h2>24/7</h2>
          <p>Gym Access</p>
        </div>
      </section>

      <section className="gallery">
        <div className="section-heading">
          <span className="eyebrow">Our Facility</span>
          <h2>Train in a space built for progress</h2>
        </div>
        <div className="gallery-grid">
          <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80" alt="Weights area" />
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80" alt="Group class" />
          <img src="https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=600&q=80" alt="Cardio equipment" />
          <img src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600&q=80" alt="Personal training" />
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span className="eyebrow">Why Forge Fitness</span>
          <h2>Built for real results</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏋️</div>
            <h3>Expert Trainers</h3>
            <p>Certified coaches guiding every step of your journey, from your first session to your PR.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Modern Equipment</h3>
            <p>Top-tier gear for strength, cardio, and recovery — always maintained, always available.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Flexible Plans</h3>
            <p>Packages built around your schedule, your budget, and your goals. No long-term lock-in.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Training Plans</h3>
            <p>Structured programs designed by your trainer and tracked as you progress day by day.</p>
          </div>
        </div>
      </section>

      {packages.length > 0 && (
        <section className="home-packages">
          <div className="section-heading">
            <span className="eyebrow">Membership</span>
            <h2>Find your plan</h2>
          </div>
          <div className="home-packages-grid">
            {packages.map((pkg, i) => (
              <div key={pkg.id} className={`home-pkg-card ${i === 1 ? 'home-pkg-card--featured' : ''}`}>
                {i === 1 && <span className="home-pkg-badge">Most Popular</span>}
                <h3>{pkg.name}</h3>
                <div className="home-pkg-price">
                  <span>R{pkg.price_regular}</span>
                  <span className="home-pkg-period">/mo</span>
                </div>
                <p className="home-pkg-student">From R{pkg.price_student}/mo for students</p>
                <Link to="/packages" className={`btn ${i === 1 ? 'primary' : 'secondary'}`}>View Details</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {trainers.length > 0 && (
        <section className="home-trainers">
          <div className="section-heading">
            <span className="eyebrow">Meet the Team</span>
            <h2>Your coaches</h2>
          </div>
          <div className="trainers-preview-grid">
            {trainers.map((t) => (
              <div key={t.id} className="trainer-preview-card">
                <div className="trainer-avatar">{t.name?.charAt(0) ?? '?'}</div>
                <h3>{t.name ?? 'Trainer'}</h3>
                <p>{t.bio}</p>
                <Link to="/trainers" className="trainer-link">View Profile →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta-banner">
        <div>
          <h2>Ready to get started?</h2>
          <p>Join Forge Fitness today and get your first class on us.</p>
        </div>
        <Link to="/signup" className="btn primary">Join Now</Link>
      </section>
    </div>
  )
}

export default Home