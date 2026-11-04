import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Trainers.css'

function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTrainers() {
      const { data, error } = await supabase
          .from('trainers')
          .select('id, name, specialty, bio, experience_years, image_url')
          .eq('is_active', true)
          .order('name')

      if (error) setError(error.message)
      else setTrainers(data ?? [])
      setLoading(false)
    }
    fetchTrainers()
  }, [])

  const q = search.toLowerCase()
  const filtered = trainers.filter(t =>
      t.name?.toLowerCase().includes(q) || t.specialty?.toLowerCase().includes(q)
  )

  if (loading) return <div className="page-loading">Loading trainers...</div>
  if (error) return <div className="page-error">Error: {error}</div>

  return (
      <div className="trainers-page">
        <div className="page-hero">
          <span className="eyebrow">Our Team</span>
          <h1>Meet the trainers who'll push you further.</h1>
          <p>Browse every trainer at Forge Fitness. No account needed to look around.</p>
        </div>

        <div className="trainers-search">
          <input
              type="text"
              placeholder="Search by name or specialty"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="trainers-search-input"
          />
        </div>

        {filtered.length === 0 ? (
            <p className="page-loading">No trainers found.</p>
        ) : (
            <div className="trainers-grid">
              {filtered.map((trainer) => (
                  <div key={trainer.id} className="trainer-card">
                    {trainer.image_url ? (
                        <img src={trainer.image_url} alt={trainer.name} className="trainer-card-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div className="trainer-card-avatar">{trainer.name?.charAt(0) ?? '?'}</div>
                    )}
                    <div className="trainer-card-body">
                      <h3>{trainer.name}</h3>
                      <p>{trainer.bio}</p>
                      <div className="trainer-tags">
                        {trainer.specialty && <span className="tag">{trainer.specialty}</span>}
                        {trainer.experience_years > 0 && <span className="tag">{trainer.experience_years} yrs experience</span>}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  )
}

export default Trainers