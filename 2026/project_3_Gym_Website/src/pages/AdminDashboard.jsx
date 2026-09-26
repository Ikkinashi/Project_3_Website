import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const TABS = ['Users', 'Bookings', 'Messages']

function AdminDashboard() {
    const [tab, setTab] = useState('Users')
    const [users, setUsers] = useState([])
    const [bookings, setBookings] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState(null)

    async function fetchUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })
        if (error) setError(error.message)
        else setUsers(data)
    }

    async function fetchBookings() {
        const { data, error } = await supabase
            .from('course_bookings')
            .select('id, status, booked_at, profiles ( full_name, email ), courses ( name )')
            .order('booked_at', { ascending: false })
        if (error) setError(error.message)
        else setBookings(data)
    }

    async function fetchMessages() {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) setError(error.message)
        else setMessages(data)
    }

    useEffect(() => {
        async function load() {
            setLoading(true)
            await Promise.all([fetchUsers(), fetchBookings(), fetchMessages()])
            setLoading(false)
        }
        load()
    }, [])

    async function changeRole(userId, newRole) {
        setSavingId(userId)
        setError('')

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            setError(error.message)
            setSavingId(null)
            return
        }

        // If promoting to trainer, make sure a matching trainers row exists
        if (newRole === 'trainer') {
            await supabase
                .from('trainers')
                .upsert({ id: userId, bio: '', specialties: [] }, { onConflict: 'id' })
        }

        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        setSavingId(null)
    }

    if (loading) return <div className="page-loading">Loading admin dashboard...</div>

    return (
        <div className="dashboard-page">
            <h1>Admin Dashboard</h1>
            {error && <p className="page-error">{error}</p>}

            <div className="admin-tabs">
                {TABS.map((t) => (
                    <button
                        key={t}
                        className={`btn ${tab === t ? 'primary' : 'secondary'}`}
                        onClick={() => setTab(t)}
                        style={{ marginRight: 8 }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Users' && (
                <section>
                    <h2>Users ({users.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Change Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.full_name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        disabled={savingId === u.id}
                                        onChange={(e) => changeRole(u.id, e.target.value)}
                                    >
                                        <option value="member">member</option>
                                        <option value="trainer">trainer</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Bookings' && (
                <section>
                    <h2>All Bookings ({bookings.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Member</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th>Booked</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td>{b.profiles?.full_name} ({b.profiles?.email})</td>
                                <td>{b.courses?.name}</td>
                                <td>{b.status}</td>
                                <td>{new Date(b.booked_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Messages' && (
                <section>
                    <h2>Contact Messages ({messages.length})</h2>
                    {messages.map((m) => (
                        <div key={m.id} className="course-card">
                            <h3>{m.name} — {m.email}</h3>
                            <p>{m.message}</p>
                            <p className="course-trainer">{new Date(m.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}

export default AdminDashboard