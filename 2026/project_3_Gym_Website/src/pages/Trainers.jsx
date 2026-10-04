import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Trainers.css'

function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [skills, setSkills] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTrainers() {
      const [trainersRes, skillsRes] = await Promise.all([
        supabase.from('trainers').select('id, name, bio, avg_rating'),
        supabase.from('trainer_skills').select('trainer_id, skill_name'),
      ])

      if (trainersRes.error) {
        setError(trainersRes.error.message)
      } else {
        setTrainers(trainersRes.data ?? [])
        const skillMap = {}
        skillsRes.data?.forEach(s => {
          if (!skillMap[s.trainer_id]) skillMap[s.trainer_id] = []
          skillMap[s.trainer_id].push(s.skill_name)
        })
        setSkills(skillMap)
      }
      setLoading(false)
    }
    fetchTrainers()
  }, [])

  const filtered = trainers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Search trainers by name"
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
              <div className="trainer-card-avatar">
                {trainer.name?.charAt(0) ?? '?'}
              </div>
              <div className="trainer-card-body">
                <h3>{trainer.name ?? 'Unnamed Trainer'}</h3>
                <p>{trainer.bio}</p>
                {(skills[trainer.id] || []).length > 0 && (
                  <div className="trainer-tags">
                    {skills[trainer.id].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="trainer-rating">
                  {'★'.repeat(Math.round(trainer.avg_rating || 0))}{'☆'.repeat(5 - Math.round(trainer.avg_rating || 0))}
                  <span>{(trainer.avg_rating || 0).toFixed(1)}</span>
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