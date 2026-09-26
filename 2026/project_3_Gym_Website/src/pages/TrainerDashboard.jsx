import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
function TrainerDashboard() {
    const { user, profile } = useAuth()
    const [courses, setCourses] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            if (!user) return
            setLoading(true)

            // Courses this trainer teaches
            const { data: myCourses, error: courseErr } = await supabase
                .from('courses')
                .select('id, name, description')
                .eq('trainer_id', user.id)

            if (courseErr) {
                setError(courseErr.message)
                setLoading(false)
                return
            }
            setCourses(myCourses ?? [])

            const courseIds = (myCourses ?? []).map((c) => c.id)
            if (courseIds.length === 0) {
                setClients([])
                setLoading(false)
                return
            }

            // Students booked into those courses
            const { data: bookings, error: bookingErr } = await supabase
                .from('course_bookings')
                .select('user_id, course_id, status, profiles ( id, full_name, email )')
                .in('course_id', courseIds)
                .eq('status', 'confirmed')

            if (bookingErr) {
                setError(bookingErr.message)
                setLoading(false)
                return
            }

            // Unique students
            const studentMap = new Map()
            for (const b of bookings ?? []) {
                if (!b.profiles) continue
                if (!studentMap.has(b.user_id)) {
                    studentMap.set(b.user_id, {
                        ...b.profiles,
                        courses: [],
                        subscription: null,
                        invoices: [],
                    })
                }
                const courseName = (myCourses ?? []).find((c) => c.id === b.course_id)?.name
                studentMap.get(b.user_id).courses.push(courseName)
            }

            const studentIds = Array.from(studentMap.keys())

            if (studentIds.length > 0) {
                const [subsResult, invoicesResult] = await Promise.all([
                    supabase
                        .from('subscriptions')
                        .select('user_id, status, current_period_end, packages ( name, price )')
                        .in('user_id', studentIds)
                        .eq('status', 'active'),
                    supabase
                        .from('invoices')
                        .select('user_id, amount, status, created_at')
                        .in('user_id', studentIds)
                        .order('created_at', { ascending: false }),
                ])

                for (const sub of subsResult.data ?? []) {
                    if (studentMap.has(sub.user_id)) {
                        studentMap.get(sub.user_id).subscription = sub
                    }
                }
                for (const inv of invoicesResult.data ?? []) {
                    if (studentMap.has(inv.user_id) && studentMap.get(inv.user_id).invoices.length < 3) {
                        studentMap.get(inv.user_id).invoices.push(inv)
                    }
                }
            }

            setClients(Array.from(studentMap.values()))
            setLoading(false)
        }

        load()
    }, [user])

    if (loading) return <div className="page-loading">Loading your dashboard...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="dashboard-page">
            <h1>Welcome, {profile?.full_name || 'Trainer'}</h1>

            <section>
                <h2>Your Classes ({courses.length})</h2>
                {courses.length === 0 ? (
                    <p>You haven't been assigned any courses yet. Ask an admin to link one to you.</p>
                ) : (
                    <ul>
                        {courses.map((c) => (
                            <li key={c.id}><strong>{c.name}</strong> — {c.description}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Your Clients ({clients.length})</h2>
                {clients.length === 0 ? (
                    <p>No students have booked into your classes yet.</p>
                ) : (
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Booked Classes</th>
                            <th>Subscription</th>
                            <th>Recent Invoices</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td>{client.full_name}</td>
                                <td>{client.email}</td>
                                <td>{client.courses.join(', ')}</td>
                                <td>
                                    {client.subscription
                                        ? `${client.subscription.packages?.name} (R${client.subscription.packages?.price})`
                                        : 'None active'}
                                </td>
                                <td>
                                    {client.invoices.length === 0
                                        ? '—'
                                        : client.invoices
                                            .map((inv) => `R${inv.amount} (${inv.status})`)
                                            .join(', ')}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}

export default TrainerDashboard