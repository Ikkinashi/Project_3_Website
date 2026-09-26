import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/TrainingPlans.css'

function TrainingPlans() {
    const { user, role } = useAuth()
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchPlans() {
            let query = supabase
                .from('training_plans')
                .select('id, name, description, created_at, created_by, profiles ( full_name )')
                .order('created_at', { ascending: false })

            if (role === 'trainer') {
                query = query.eq('created_by', user.id)
            }

            const { data, error } = await query

            if (error) setError(error.message)
            else setPlans(data)
            setLoading(false)
        }

        if (user) fetchPlans()
    }, [user, role])

    if (loading) return <div className="page-loading">Loading training plans...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="training-plans-page">
            <div className="page-hero">
                <span className="eyebrow">Programs</span>
                <h1>Training Plans</h1>
                <p>Personalized plans designed by your trainer.</p>
            </div>

            {plans.length === 0 ? (
                <p>No training plans yet.</p>
            ) : (
                <div className="plans-list">
                    {plans.map((plan) => (
                        <div key={plan.id} className="plan-card">
                            <h3>{plan.name}</h3>
                            <p>{plan.description}</p>
                            <p className="plan-meta">
                                By {plan.profiles?.full_name ?? 'Unknown'} ·{' '}
                                {new Date(plan.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TrainingPlans