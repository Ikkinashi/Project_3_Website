import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Trainers.css'

function Trainers() {
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchTrainers() {
            const { data, error } = await supabase
                .from('trainers')
                .select(`
                    id,
                    bio,
                    specialties,
                    profiles ( full_name, email )
                `)

            if (error) {
                setError(error.message)
            } else {
                setTrainers(data)
            }
            setLoading(false)
        }

        fetchTrainers()
    }, [])

    if (loading) return <div className="page-loading">Loading trainers...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="trainers-page">
            <h1>Trainers</h1>

            {trainers.length === 0 ? (
                <p>No trainers listed yet.</p>
            ) : (
                <div className="trainers-grid">
                    {trainers.map((trainer) => (
                        <div key={trainer.id} className="trainer-card">
                            <h3>{trainer.profiles?.full_name ?? 'Unnamed Trainer'}</h3>
                            <p>{trainer.bio}</p>
                            {trainer.specialties && (
                                <div className="trainer-tags">
                                    {trainer.specialties.map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Trainers