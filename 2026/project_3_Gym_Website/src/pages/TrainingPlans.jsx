import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/TrainingPlans.css'

function TrainingPlans() {
    const { user } = useAuth()
    const [plans, setPlans] = useState([])
    const [days, setDays] = useState({})
    const [exercises, setExercises] = useState({})
    const [expanded, setExpanded] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchPlans() {
            const [plansRes, daysRes, exercisesRes] = await Promise.all([
                supabase.from('training_plans').select('id, title, description, duration_days, course_id, courses ( title )'),
                supabase.from('plan_days').select('id, plan_id, day_number, description, image_url'),
                supabase.from('exercises').select('id, day_id, exercise_name, sets, reps'),
            ])

            if (plansRes.error) { setError(plansRes.error.message); setLoading(false); return }

            const dayMap = {}
            daysRes.data?.forEach(d => {
                if (!dayMap[d.plan_id]) dayMap[d.plan_id] = []
                dayMap[d.plan_id].push(d)
            })

            const exMap = {}
            exercisesRes.data?.forEach(e => {
                if (!exMap[e.day_id]) exMap[e.day_id] = []
                exMap[e.day_id].push(e)
            })

            setPlans(plansRes.data ?? [])
            setDays(dayMap)
            setExercises(exMap)
            setLoading(false)
        }
        fetchPlans()
    }, [user])

    if (loading) return <div className="page-loading">Loading training plans...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="training-plans-page">
            <div className="page-hero">
                <span className="eyebrow">Programs</span>
                <h1>Training Plans</h1>
                <p>Structured day by day programs to follow at home or in the gym.</p>
            </div>

            {plans.length === 0 ? (
                <p>No training plans available yet.</p>
            ) : (
                <div className="plans-list">
                    {plans.map((plan) => (
                        <div key={plan.id} className="plan-card">
                            <div className="plan-card-header" onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
                                <div>
                                    <h3>{plan.title}</h3>
                                    <p>{plan.description}</p>
                                    {plan.courses?.title && (
                                        <span className="plan-course">Part of: {plan.courses.title}</span>
                                    )}
                                </div>
                                <div className="plan-meta-right">
                                    <span className="plan-duration">{plan.duration_days} days</span>
                                    <span className="plan-expand">{expanded === plan.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {expanded === plan.id && (
                                <div className="plan-days">
                                    {(days[plan.id] || []).sort((a, b) => a.day_number - b.day_number).map(day => (
                                        <div key={day.id} className="plan-day">
                                            <div className="plan-day-header">
                                                <span className="day-number">Day {day.day_number}</span>
                                                <p>{day.description}</p>
                                            </div>
                                            {day.image_url && (
                                                <img src={day.image_url} alt={`Day ${day.day_number}`} className="day-image" />
                                            )}
                                            {(exercises[day.id] || []).length > 0 && (
                                                <table className="exercise-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Exercise</th>
                                                            <th>Sets</th>
                                                            <th>Reps</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exercises[day.id].map(ex => (
                                                            <tr key={ex.id}>
                                                                <td>{ex.exercise_name}</td>
                                                                <td>{ex.sets}</td>
                                                                <td>{ex.reps}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
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

export default TrainingPlans