import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const TABS = ['Users', 'Courses', 'Trainers', 'Packages', 'Enrollments', 'Transactions', 'Messages']

function AdminDashboard() {
    const [tab, setTab] = useState('Users')
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [trainers, setTrainers] = useState([])
    const [packages, setPackages] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [transactions, setTransactions] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState(null)
    const [newCourse, setNewCourse] = useState({ title: '', description: '', difficulty: '', trainer_id: '' })

    async function fetchAll() {
        setLoading(true)
        const [
            usersRes, coursesRes, trainersRes, packagesRes,
            enrollmentsRes, transactionsRes, messagesRes,
        ] = await Promise.all([
            supabase.from('profiles').select('id, full_name, role, is_student_verified'),
            supabase.from('courses').select('id, title, description, difficulty, trainers ( name )'),
            supabase.from('trainers').select('id, name, bio, avg_rating, locations ( name )'),
            supabase.from('packages').select('id, name, price_regular, price_student, is_active'),
            supabase.from('enrollments').select('id, enrolled_at, completed_at, profiles ( full_name ), courses ( title )'),
            supabase.from('transactions').select('id, amount_paid, discount_applied, status, payment_method, created_at, profiles ( full_name ), packages ( name )'),
            supabase.from('contact_enquiries').select('id, name, email, message, status, created_at').order('created_at', { ascending: false }),
        ])

        if (usersRes.error) setError(usersRes.error.message)

        setUsers(usersRes.data ?? [])
        setCourses(coursesRes.data ?? [])
        setTrainers(trainersRes.data ?? [])
        setPackages(packagesRes.data ?? [])
        setEnrollments(enrollmentsRes.data ?? [])
        setTransactions(transactionsRes.data ?? [])
        setMessages(messagesRes.data ?? [])
        setLoading(false)
    }

    useEffect(() => {
    async function load() {
        await fetchAll()
    }
    load()
    }, [])

    async function changeRole(userId, newRole) {
        setSavingId(userId)
        setError('')
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
        if (error) { setError(error.message); setSavingId(null); return }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setSavingId(null)
    }

    async function handleAddCourse(e) {
        e.preventDefault()
        if (!newCourse.title) return
        const { error } = await supabase.from('courses').insert([{
            title: newCourse.title,
            description: newCourse.description,
            difficulty: newCourse.difficulty || null,
            trainer_id: newCourse.trainer_id || null,
        }])
        if (error) { setError(error.message); return }
        setNewCourse({ title: '', description: '', difficulty: '', trainer_id: '' })
        fetchAll()
    }

    async function handleDeleteCourse(id) {
        const { error } = await supabase.from('courses').delete().eq('id', id)
        if (error) { setError(error.message); return }
        setCourses(prev => prev.filter(c => c.id !== id))
    }

    async function markMessageRead(id) {
        await supabase.from('contact_enquiries').update({ status: 'read' }).eq('id', id)
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m))
    }

    if (loading) return <div className="page-loading">Loading admin dashboard...</div>

    return (
        <div className="dashboard-page">
            <div className="page-hero">
                <span className="eyebrow">Control Panel</span>
                <h1>Admin Dashboard</h1>
                <p>Full visibility and control over members, staff, courses, memberships, and enquiries.</p>
            </div>

            {error && <p className="page-error">{error}</p>}

            <div className="admin-tabs">
                {TABS.map(t => (
                    <button
                        key={t}
                        className={`btn ${tab === t ? 'primary' : 'secondary'}`}
                        onClick={() => setTab(t)}
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
                            <tr><th>Name</th><th>Role</th><th>Student Verified</th><th>Change Role</th></tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.full_name}</td>
                                    <td><span className="role-pill">{u.role}</span></td>
                                    <td>{u.is_student_verified ? '✓ Yes' : '—'}</td>
                                    <td>
                                        <select
                                            value={u.role}
                                            disabled={savingId === u.id}
                                            onChange={e => changeRole(u.id, e.target.value)}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '0.3rem 0.5rem', fontFamily: 'inherit' }}
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
                        <input placeholder="Course title" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} required />
                        <input placeholder="Description" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                        <input placeholder="Difficulty" value={newCourse.difficulty} onChange={e => setNewCourse({ ...newCourse, difficulty: e.target.value })} />
                        <select value={newCourse.trainer_id} onChange={e => setNewCourse({ ...newCourse, trainer_id: e.target.value })}>
                            <option value="">No trainer</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button type="submit" className="btn primary">Add Course</button>
                    </form>
                    <table className="invoice-table">
                        <thead><tr><th>Title</th><th>Difficulty</th><th>Trainer</th><th></th></tr></thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c.id}>
                                    <td>{c.title}</td>
                                    <td>{c.difficulty || '—'}</td>
                                    <td>{c.trainers?.name || '—'}</td>
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
                        <thead><tr><th>Name</th><th>Bio</th><th>Avg Rating</th><th>Location</th></tr></thead>
                        <tbody>
                            {trainers.map(t => (
                                <tr key={t.id}>
                                    <td>{t.name}</td>
                                    <td>{t.bio || '—'}</td>
                                    <td>{t.avg_rating ?? '—'}</td>
                                    <td>{t.locations?.name || '—'}</td>
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
                        <thead><tr><th>Name</th><th>Regular Price</th><th>Student Price</th><th>Active</th></tr></thead>
                        <tbody>
                            {packages.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>R{p.price_regular}</td>
                                    <td>R{p.price_student}</td>
                                    <td>{p.is_active ? '✓' : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Enrollments' && (
                <section>
                    <h2>Enrollments ({enrollments.length})</h2>
                    <table className="invoice-table">
                        <thead><tr><th>Member</th><th>Course</th><th>Enrolled</th><th>Completed</th></tr></thead>
                        <tbody>
                            {enrollments.map(e => (
                                <tr key={e.id}>
                                    <td>{e.profiles?.full_name || '—'}</td>
                                    <td>{e.courses?.title || '—'}</td>
                                    <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                                    <td>{e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Transactions' && (
                <section>
                    <h2>Transactions ({transactions.length})</h2>
                    <table className="invoice-table">
                        <thead><tr><th>Member</th><th>Package</th><th>Amount</th><th>Discount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.profiles?.full_name || '—'}</td>
                                    <td>{tx.packages?.name || '—'}</td>
                                    <td>R{tx.amount_paid}</td>
                                    <td>{tx.discount_applied ? '✓ Student' : '—'}</td>
                                    <td>{tx.payment_method || '—'}</td>
                                    <td><span className="role-pill">{tx.status}</span></td>
                                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Messages' && (
                <section>
                    <h2>Contact Enquiries ({messages.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(m => (
                            <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{m.name} {m.email ? `— ${m.email}` : ''}</p>
                                    <p style={{ marginBottom: '0.5rem' }}>{m.message}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                    <span className="role-pill">{m.status}</span>
                                    {m.status === 'new' && (
                                        <button className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => markMessageRead(m.id)}>
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default AdminDashboard