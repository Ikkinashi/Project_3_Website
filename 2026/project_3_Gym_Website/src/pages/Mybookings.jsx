import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Courses.css'

function MyBookings() {
    const { user } = useAuth()
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from('enrollments')
                .select('id, enrolled_at, completed_at, courses ( id, title, description, level )')
                .eq('user_id', user.id)
                .order('enrolled_at', { ascending: false })

            if (error) setError(error.message)
            else setEnrollments(data ?? [])
            setLoading(false)
        }
        if (user) load()
    }, [user])

    async function handleUnenroll(id) {
        const { error } = await supabase.from('enrollments').delete().eq('id', id)
        if (error) { setError(error.message); return }
        setEnrollments(prev => prev.filter(e => e.id !== id))
    }

    if (loading) return <div className="page-loading">Loading your enrollments...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="my-bookings-page">
            <div className="page-hero">
                <span className="eyebrow">Your Schedule</span>
                <h1>My Enrollments</h1>
                <p>Courses you are currently enrolled in.</p>
            </div>

            {enrollments.length === 0 ? (
                <p>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>.</p>
            ) : (
                <div className="courses-grid">
                    {enrollments.map((e) => (
                        <div key={e.id} className="course-card">
                            {e.courses?.level && <span className="course-difficulty">{e.courses.level}</span>}
                            <h3>{e.courses?.title}</h3>
                            <p>{e.courses?.description}</p>
                            <p className="course-trainer">
                                Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                                {e.completed_at && ' · Completed'}
                            </p>
                            {!e.completed_at && (
                                <button className="btn secondary" onClick={() => handleUnenroll(e.id)}>Unenroll</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookings