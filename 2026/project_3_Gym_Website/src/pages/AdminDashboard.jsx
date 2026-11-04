import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const TABS = ['Users', 'Courses', 'Trainers', 'Packages', 'Enrollments', 'Transactions', 'Messages']
const EMPTY_COURSE = { title: '', description: '', level: '', category: '', schedule_day: '', schedule_time: '', duration_minutes: '', trainer_id: '' }
const EMPTY_TRAINER = { name: '', specialty: '', bio: '', experience_years: '', user_id: '' }
const selectStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '0.3rem 0.5rem', fontFamily: 'inherit' }

function AdminDashboard() {
    const [tab, setTab] = useState('Users')
    const [users, setUsers] = useState([])
    const [studentReqs, setStudentReqs] = useState({})
    const [courses, setCourses] = useState([])
    const [trainers, setTrainers] = useState([])
    const [packages, setPackages] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [transactions, setTransactions] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState(null)
    const [newCourse, setNewCourse] = useState(EMPTY_COURSE)
    const [newTrainer, setNewTrainer] = useState(EMPTY_TRAINER)

    async function fetchAll() {
        const results = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, role, is_student_verified').order('full_name'),
            supabase.from('student_profiles').select('user_id, student_id_number, university_name, verification_status'),
            supabase.from('courses').select('id, title, level, category, is_active, trainers ( name )').order('title'),
            supabase.from('trainers').select('id, name, specialty, bio, avg_rating, is_active, user_id, locations ( name )').order('name'),
            supabase.from('packages').select('id, name, price_regular, price_student, is_active').order('sort_order'),
            supabase.from('enrollments').select('id, enrolled_at, completed_at, profiles ( full_name ), courses ( title )').order('enrolled_at', { ascending: false }),
            supabase.from('transactions').select('id, amount_paid, discount_applied, status, payment_method, created_at, profiles ( full_name ), packages ( name )').order('created_at', { ascending: false }),
            supabase.from('contact_enquiries').select('id, name, email, message, status').order('id', { ascending: false }),
        ])
        const [usersRes, studentsRes, coursesRes, trainersRes, packagesRes, enrollmentsRes, transactionsRes, messagesRes] = results

        const firstErr = results.find(r => r.error)
        setError(firstErr ? firstErr.error.message : '')

        setUsers(usersRes.data ?? [])
        setStudentReqs(Object.fromEntries((studentsRes.data ?? []).map(s => [s.user_id, s])))
        setCourses(coursesRes.data ?? [])
        setTrainers(trainersRes.data ?? [])
        setPackages(packagesRes.data ?? [])
        setEnrollments(enrollmentsRes.data ?? [])
        setTransactions(transactionsRes.data ?? [])
        setMessages(messagesRes.data ?? [])
        setLoading(false)
    }

    useEffect(() => {
        async function load() { await fetchAll() }
        load()
    }, [])

    async function run(promise, after) {
        setError('')
        const { error } = await promise
        if (error) { setError(error.message); return false }
        if (after) await after()
        return true
    }

    async function changeRole(userId, newRole) {
        setSavingId(userId)
        const ok = await run(supabase.from('profiles').update({ role: newRole }).eq('id', userId))
        if (ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setSavingId(null)
    }

    async function toggleStudent(u) {
        const verify = !u.is_student_verified
        setSavingId(u.id)
        const ok = await run(supabase.from('profiles').update({ is_student_verified: verify }).eq('id', u.id))
        if (ok) {
            if (studentReqs[u.id]) {
                await supabase.from('student_profiles').update({ verification_status: verify ? 'approved' : 'pending' }).eq('user_id', u.id)
            }
            await fetchAll()
        }
        setSavingId(null)
    }

    async function handleAddCourse(e) {
        e.preventDefault()
        if (!newCourse.title) return
        const ok = await run(supabase.from('courses').insert([{
            title: newCourse.title,
            description: newCourse.description || null,
            level: newCourse.level || null,
            category: newCourse.category || null,
            schedule_day: newCourse.schedule_day || null,
            schedule_time: newCourse.schedule_time || null,
            duration_minutes: newCourse.duration_minutes ? Number(newCourse.duration_minutes) : null,
            trainer_id: newCourse.trainer_id || null,
            is_active: true,
        }]))
        if (ok) { setNewCourse(EMPTY_COURSE); fetchAll() }
    }

    async function toggleCourse(c) {
        await run(supabase.from('courses').update({ is_active: !c.is_active }).eq('id', c.id), fetchAll)
    }

    async function deleteCourse(id) {
        await run(supabase.from('courses').delete().eq('id', id), fetchAll)
    }

    async function handleAddTrainer(e) {
        e.preventDefault()
        if (!newTrainer.name) return
        const ok = await run(supabase.from('trainers').insert([{
            name: newTrainer.name,
            specialty: newTrainer.specialty || null,
            bio: newTrainer.bio || null,
            experience_years: newTrainer.experience_years ? Number(newTrainer.experience_years) : 0,
            user_id: newTrainer.user_id || null,
            is_active: true,
        }]))
        if (ok) { setNewTrainer(EMPTY_TRAINER); fetchAll() }
    }

    async function toggleTrainer(t) {
        await run(supabase.from('trainers').update({ is_active: !t.is_active }).eq('id', t.id), fetchAll)
    }

    async function togglePackage(p) {
        await run(supabase.from('packages').update({ is_active: !p.is_active }).eq('id', p.id), fetchAll)
    }

    async function markMessageRead(id) {
        const ok = await run(supabase.from('contact_enquiries').update({ status: 'read' }).eq('id', id))
        if (ok) setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m))
    }

    if (loading) return <div className="page-loading">Loading admin dashboard...</div>

    const trainerUsers = users.filter(u => u.role === 'trainer')

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
                    <button key={t} className={`btn ${tab === t ? 'primary' : 'secondary'}`} onClick={() => setTab(t)}>{t}</button>
                ))}
            </div>

            {tab === 'Users' && (
                <section>
                    <h2>Users ({users.length})</h2>
                    <table className="invoice-table">
                        <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Student</th><th>Change Role</th><th></th></tr>
                        </thead>
                        <tbody>
                        {users.map(u => {
                            const req = studentReqs[u.id]
                            return (
                                <tr key={u.id}>
                                    <td>{u.full_name}</td>
                                    <td>{u.email || '—'}</td>
                                    <td><span className="role-pill">{u.role}</span></td>
                                    <td>
                                        {u.is_student_verified ? '✓ Verified' : req ? `Pending (${req.university_name}, ${req.student_id_number})` : '—'}
                                    </td>
                                    <td>
                                        <select value={u.role} disabled={savingId === u.id} onChange={e => changeRole(u.id, e.target.value)} style={selectStyle}>
                                            <option value="member">member</option>
                                            <option value="trainer">trainer</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="btn secondary" disabled={savingId === u.id} onClick={() => toggleStudent(u)}>
                                            {u.is_student_verified ? 'Revoke Student' : 'Verify Student'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
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
                        <input placeholder="Level" value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })} />
                        <input placeholder="Category" value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} />
                        <input placeholder="Day (e.g. Monday)" value={newCourse.schedule_day} onChange={e => setNewCourse({ ...newCourse, schedule_day: e.target.value })} />
                        <input placeholder="Time (18:00)" value={newCourse.schedule_time} onChange={e => setNewCourse({ ...newCourse, schedule_time: e.target.value })} />
                        <input type="number" min="0" placeholder="Minutes" value={newCourse.duration_minutes} onChange={e => setNewCourse({ ...newCourse, duration_minutes: e.target.value })} />
                        <select value={newCourse.trainer_id} onChange={e => setNewCourse({ ...newCourse, trainer_id: e.target.value })}>
                            <option value="">No trainer</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button type="submit" className="btn primary">Add Course</button>
                    </form>
                    <table className="invoice-table">
                        <thead><tr><th>Title</th><th>Level</th><th>Category</th><th>Trainer</th><th>Active</th><th></th></tr></thead>
                        <tbody>
                        {courses.map(c => (
                            <tr key={c.id}>
                                <td>{c.title}</td>
                                <td>{c.level || '—'}</td>
                                <td>{c.category || '—'}</td>
                                <td>{c.trainers?.name || '—'}</td>
                                <td><button className="btn secondary" onClick={() => toggleCourse(c)}>{c.is_active ? '✓ Active' : 'Inactive'}</button></td>
                                <td><button className="btn secondary" onClick={() => deleteCourse(c.id)}>Delete</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {tab === 'Trainers' && (
                <section>
                    <h2>Trainers ({trainers.length})</h2>
                    <form className="inline-form" onSubmit={handleAddTrainer}>
                        <input placeholder="Name" value={newTrainer.name} onChange={e => setNewTrainer({ ...newTrainer, name: e.target.value })} required />
                        <input placeholder="Specialty" value={newTrainer.specialty} onChange={e => setNewTrainer({ ...newTrainer, specialty: e.target.value })} />
                        <input placeholder="Bio" value={newTrainer.bio} onChange={e => setNewTrainer({ ...newTrainer, bio: e.target.value })} />
                        <input type="number" min="0" placeholder="Years exp." value={newTrainer.experience_years} onChange={e => setNewTrainer({ ...newTrainer, experience_years: e.target.value })} />
                        <select value={newTrainer.user_id} onChange={e => setNewTrainer({ ...newTrainer, user_id: e.target.value })}>
                            <option value="">No linked login</option>
                            {trainerUsers.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                        </select>
                        <button type="submit" className="btn primary">Add Trainer</button>
                    </form>
                    <table className="invoice-table">
                        <thead><tr><th>Name</th><th>Specialty</th><th>Bio</th><th>Rating</th><th>Location</th><th>Login linked</th><th>Active</th></tr></thead>
                        <tbody>
                        {trainers.map(t => (
                            <tr key={t.id}>
                                <td>{t.name}</td>
                                <td>{t.specialty || '—'}</td>
                                <td>{t.bio || '—'}</td>
                                <td>{t.avg_rating ?? '—'}</td>
                                <td>{t.locations?.name || '—'}</td>
                                <td>{t.user_id ? '✓' : '—'}</td>
                                <td><button className="btn secondary" onClick={() => toggleTrainer(t)}>{t.is_active ? '✓ Active' : 'Inactive'}</button></td>
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
                                <td><button className="btn secondary" onClick={() => togglePackage(p)}>{p.is_active ? '✓ Active' : 'Inactive'}</button></td>
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
                                    <p>{m.message}</p>
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