import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Courses.css'

function Courses() {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [enrolledIds, setEnrolledIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)

    async function fetchCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select('id, title, description, difficulty, trainer_id, trainers ( id, name, bio )')

        if (error) setError(error.message)
        else setCourses(data ?? [])
    }


    useEffect(() => {
    async function load() {
        setLoading(true)
        await fetchCourses()
        if (user) {
            const { data } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('user_id', user.id)
            if (data) setEnrolledIds(new Set(data.map(e => e.course_id)))
        }
        setLoading(false)
    }
    load()
    }, [user])

    async function handleEnroll(courseId) {
        if (!user) { setError('Please log in to enroll in a course.'); return }
        setBusyId(courseId)
        setError('')

        const { error } = await supabase
            .from('enrollments')
            .insert([{ user_id: user.id, course_id: courseId }])

        setBusyId(null)
        if (error) { setError(error.message); return }
        setEnrolledIds(prev => new Set(prev).add(courseId))
    }

    async function handleUnenroll(courseId) {
        if (!user) return
        setBusyId(courseId)
        setError('')

        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('user_id', user.id)
            .eq('course_id', courseId)

        setBusyId(null)
        if (error) { setError(error.message); return }
        setEnrolledIds(prev => { const next = new Set(prev); next.delete(courseId); return next })
    }

    if (loading) return <div className="page-loading">Loading courses...</div>

    return (
        <div className="courses-page">
            <div className="page-hero">
                <span className="eyebrow">Training</span>
                <h1>Courses</h1>
                <p>Browse available courses and enroll to start training.</p>
            </div>

            {error && <p className="page-error">{error}</p>}

            {courses.length === 0 ? (
                <p>No courses available yet.</p>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => {
                        const isEnrolled = enrolledIds.has(course.id)
                        const isBusy = busyId === course.id

                        return (
                            <div key={course.id} className="course-card">
                                {course.difficulty && (
                                    <span className="course-difficulty">{course.difficulty}</span>
                                )}
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                {course.trainers && (
                                    <p className="course-trainer">Trainer: {course.trainers.name}</p>
                                )}
                                {isEnrolled ? (
                                    <button
                                        className="btn secondary"
                                        disabled={isBusy}
                                        onClick={() => handleUnenroll(course.id)}
                                    >
                                        {isBusy ? 'Cancelling...' : 'Unenroll'}
                                    </button>
                                ) : (
                                    <button
                                        className="btn primary"
                                        disabled={isBusy}
                                        onClick={() => handleEnroll(course.id)}
                                    >
                                        {isBusy ? 'Enrolling...' : user ? 'Enroll' : 'Log In to Enroll'}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Courses