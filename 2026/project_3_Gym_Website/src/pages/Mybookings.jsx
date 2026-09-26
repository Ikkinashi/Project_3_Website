import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'

function MyBookings() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function fetchBookings() {
        const { data, error } = await supabase
            .from('course_bookings')
            .select('id, status, booked_at, courses ( id, name, description )')
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .order('booked_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setBookings(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (user) fetchBookings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    async function handleCancel(bookingId) {
        const { error } = await supabase
            .from('course_bookings')
            .delete()
            .eq('id', bookingId)

        if (error) {
            setError(error.message)
            return
        }
        setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    }

    if (loading) return <div className="page-loading">Loading your bookings...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="my-bookings-page">
            <h1>My Bookings</h1>

            {bookings.length === 0 ? (
                <p>You haven't booked any classes yet. <a href="/courses">Browse courses</a>.</p>
            ) : (
                <div className="courses-grid">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="course-card">
                            <h3>{booking.courses?.name}</h3>
                            <p>{booking.courses?.description}</p>
                            <p className="course-trainer">
                                Booked {new Date(booking.booked_at).toLocaleDateString()}
                            </p>
                            <button className="btn secondary" onClick={() => handleCancel(booking.id)}>
                                Cancel Booking
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookings