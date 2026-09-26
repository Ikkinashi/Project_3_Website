import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const TABS = ['Users', 'Courses', 'Trainers', 'Packages', 'Bookings', 'Subscriptions', 'Invoices', 'Messages']

function AdminDashboard() {
    const [tab, setTab] = useState('Users')
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [trainers, setTrainers] = useState([])
    const [packages, setPackages] = useState([])
    const [bookings, setBookings] = useState([])
    const [subscriptions, setSubscriptions] = useState([])
    const [invoices, setInvoices] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState(null)

    // New course form state
    const [newCourse, setNewCourse] = useState({ name: '', description: '', trainer_id: '' })

    async function fetchAll() {
        setLoading(true)
        const [
            usersRes, coursesRes, trainersRes, packagesRes,
            bookingsRes, subsRes, invoicesRes, messagesRes,
        ] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }),
            supabase.from('courses').select('id, name, description, trainer_id, trainers ( profiles ( full_name ) )').order('created_at', { ascending: false }),
            supabase.from('trainers').select('id, bio, specialties, profiles ( full_name, email )'),
            supabase.from('packages').select('*').order('price', { ascending: true }),
            supabase.from('course_bookings').select('id, status, booked_at, profiles ( full_name, email ), courses ( name )').order('booked_at', { ascending: false }),
            supabase.from('subscriptions').select('id, status, current_period_end, profiles ( full_name, email ), packages ( name, price )').order('created_at', { ascending: false }),
            supabase.from('invoices').select('id, amount, status, created_at, profiles ( full_name, email )').order('created_at', { ascending: false }),
            supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        ])

        if (usersRes.error) setError(usersRes.error.message)

        setUsers(usersRes.data ?? [])
        setCourses(coursesRes.data ?? [])
        setTrainers(trainersRes.data ?? [])
        setPackages(packagesRes.data ?? [])
        setBookings(bookingsRes.data ?? [])
        setSubscriptions(subsRes.data ?? [])
        setInvoices(invoicesRes.data ?? [])
        setMessages(messagesRes.data ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    async function changeRole(userId, newRole) {
        setSavingId(userId)
        setError('')

        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)

        if (error) {
            setError(error.message)
            setSavingId(null)
            return
        }

        if (newRole === 'trainer') {
            await supabase.from('trainers').upsert({ id: userId, bio: '', specialties: [] }, { onConflict: 'id' })
        }

        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        setSavingId(null)
    }

    async function handleAddCourse(e) {
        e.preventDefault()
        if (!newCourse.name) return

        const { error } = await supabase.from('courses').insert([{
            name: newCourse.name,
            description: newCourse.description,
            trainer_id: newCourse.trainer_id || null,
        }])

        if (error) { setError(error.message); return }

        setNewCourse({ name: '', description: '', trainer_id: '' })
        fetchAll()
    }

    async function handleDeleteCourse(id) {
        const { error } = await supabase.from('courses').delete().eq('id', id)
        if (error) { setError(error.message); return }
        setCourses((prev) => prev.filter((c) => c.id !== id))
    }

    if (loading) return <div className="page-loading">Loading admin dashboard...</div>

    return (
        <div className="dashboard-page">
            <div className="page-hero">
                <span className="eyebrow">Control Panel</span>
                <h1>Admin Dashboard</h1>
                <p>Full visibility and control over every part of the gym — members, staff, classes, memberships, and finances.</p>
            </div>

            {error && <p className="page-error">{error}</p>}

            <div className="admin-tabs">
                {TABS.map((t) => (
                    <button
                        key={t}
                        className={`btn ${tab === t ? 'primary' : 'secondary'}`}
                        onClick={() => setTab(t)}
                        style={{ marginRight: 8, marginBottom: 8 }}
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
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Change Role</th></tr>
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

            {tab === 'Courses' && (
                <section>
                    <h2>Courses ({courses.length})</h2>

                    <form className="inline-form" onSubmit={handleAddCourse}>
                        <input
                            placeholder="Course name"
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Description"
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        />
                        <select
                            value={newCourse.trainer_id}
                            onChange={(e) => setNewCourse({ ...newCourse, trainer_id: e.target.value })}
                        >
                            <option value="">No trainer assigned</option>
                            {trainers.map((t) => (
                                <option key={t.id} value={t.id}>{t.profiles?.full_name ?? 'Unnamed'}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn primary">Add Course</button>
                    </form>

                    <table className="invoice-table">
                        <thead>
                        <tr><th>Name</th><th>Description</th><th>Trainer</th><th></th></tr>
                        </thead>
                        <tbody>
                        {courses.map((c) => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{c.description}</td>
                                <td>{c.trainers?.profiles?.full_name ?? '—'}</td>
                                <td><button className="btn secondary" onClick={() => handleDeleteCourse(c.id)}>Delete</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Trainers' && (
                <section>
                    <h2>Trainers ({trainers.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Name</th><th>Email</th><th>Bio</th><th>Specialties</th></tr>
                        </thead>
                        <tbody>
                        {trainers.map((t) => (
                            <tr key={t.id}>
                                <td>{t.profiles?.full_name ?? '—'}</td>
                                <td>{t.profiles?.email ?? '—'}</td>
                                <td>{t.bio}</td>
                                <td>{(t.specialties ?? []).join(', ')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Packages' && (
                <section>
                    <h2>Packages ({packages.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Name</th><th>Price</th><th>Period</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                        {packages.map((p) => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>R{p.price}</td>
                                <td>{p.billing_period}</td>
                                <td>{p.description}</td>
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
                        <tr><th>Member</th><th>Class</th><th>Status</th><th>Booked</th></tr>
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

            {tab === 'Subscriptions' && (
                <section>
                    <h2>Subscriptions ({subscriptions.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Member</th><th>Package</th><th>Status</th><th>Renews</th></tr>
                        </thead>
                        <tbody>
                        {subscriptions.map((s) => (
                            <tr key={s.id}>
                                <td>{s.profiles?.full_name} ({s.profiles?.email})</td>
                                <td>{s.packages?.name} (R{s.packages?.price})</td>
                                <td>{s.status}</td>
                                <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Invoices' && (
                <section>
                    <h2>Invoices ({invoices.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Member</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td>{inv.profiles?.full_name} ({inv.profiles?.email})</td>
                                <td>R{inv.amount}</td>
                                <td>{inv.status}</td>
                                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
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
                        <div key={m.id} className="course-card" style={{ marginBottom: '0.75rem' }}>
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