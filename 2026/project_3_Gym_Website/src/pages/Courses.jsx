import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Courses.css'

function Courses() {
    const { user } = useAuth()
    const [courses, setCourses] = useState([])
    const [bookedIds, setBookedIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [bookingId, setBookingId] = useState(null)

    async function fetchCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                id,
                name,
                description,
                trainers ( id, bio )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setCourses(data)
        }
    }

    async function fetchMyBookings() {
        if (!user) {
            setBookedIds(new Set())
            return
        }
        const { data, error } = await supabase
            .from('course_bookings')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('status', 'confirmed')

        if (!error && data) {
            setBookedIds(new Set(data.map((b) => b.course_id)))
        }
    }

    useEffect(() => {
        async function load() {
            setLoading(true)
            await Promise.all([fetchCourses(), fetchMyBookings()])
            setLoading(false)
        }
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    async function handleBook(courseId) {
        if (!user) {
            setError('Please log in to book a class.')
            return
        }
        setBookingId(courseId)
        setError('')

        const { error } = await supabase
            .from('course_bookings')
            .insert([{ user_id: user.id, course_id: courseId }])

        setBookingId(null)

        if (error) {
            setError(error.message)
            return
        }

        setBookedIds((prev) => new Set(prev).add(courseId))
    }

    async function handleCancel(courseId) {
        if (!user) return
        setBookingId(courseId)
        setError('')

        const { error } = await supabase
            .from('course_bookings')
            .delete()
            .eq('user_id', user.id)
            .eq('course_id', courseId)

        setBookingId(null)

        if (error) {
            setError(error.message)
            return
        }

        setBookedIds((prev) => {
            const next = new Set(prev)
            next.delete(courseId)
            return next
        })
    }

    if (loading) return <div className="page-loading">Loading courses...</div>

    return (
        <div className="courses-page">
            <h1>Courses</h1>

            {error && <p className="page-error">{error}</p>}

            {courses.length === 0 ? (
                <p>No courses available yet.</p>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => {
                        const isBooked = bookedIds.has(course.id)
                        const isBusy = bookingId === course.id

                        return (
                            <div key={course.id} className="course-card">
                                <h3>{course.name}</h3>
                                <p>{course.description}</p>
                                {course.trainers && (
                                    <p className="course-trainer">
                                        Trainer bio: {course.trainers.bio}
                                    </p>
                                )}

                                {isBooked ? (
                                    <button
                                        className="btn secondary"
                                        disabled={isBusy}
                                        onClick={() => handleCancel(course.id)}
                                    >
                                        {isBusy ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                ) : (
                                    <button
                                        className="btn primary"
                                        disabled={isBusy}
                                        onClick={() => handleBook(course.id)}
                                    >
                                        {isBusy ? 'Booking...' : user ? 'Book Class' : 'Log In to Book'}
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