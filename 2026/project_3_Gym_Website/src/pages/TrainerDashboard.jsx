import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'

function TrainerDashboard() {
    const { user, profile, role } = useAuth()
    const [tab, setTab] = useState('Classes')
    const [courses, setCourses] = useState([])
    const [clients, setClients] = useState([])
    const [transactions, setTransactions] = useState([])
    const [noTrainerRow, setNoTrainerRow] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            if (!user) return
            setLoading(true)

            let courseQuery = supabase
                .from('courses')
                .select('id, title, description, level, schedule_day, schedule_time, trainer_id')
                .order('title')

            if (role !== 'admin') {
                const { data: trainer, error: tErr } = await supabase
                    .from('trainers')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle()

                if (tErr) { setError(tErr.message); setLoading(false); return }
                if (!trainer) {
                    setNoTrainerRow(true)
                    setLoading(false)
                    return
                }
                courseQuery = courseQuery.eq('trainer_id', trainer.id)
            }

            const { data: myCourses, error: courseErr } = await courseQuery
            if (courseErr) { setError(courseErr.message); setLoading(false); return }
            setCourses(myCourses ?? [])

            const courseIds = (myCourses ?? []).map((c) => c.id)
            if (courseIds.length === 0) { setLoading(false); return }

            const { data: enrollments, error: enrErr } = await supabase
                .from('enrollments')
                .select('user_id, course_id, enrolled_at, profiles ( id, full_name, email )')
                .in('course_id', courseIds)

            if (enrErr) { setError(enrErr.message); setLoading(false); return }

            const studentMap = new Map()
            for (const e of enrollments ?? []) {
                if (!e.profiles) continue
                if (!studentMap.has(e.user_id)) {
                    studentMap.set(e.user_id, { ...e.profiles, courses: [] })
                }
                const title = myCourses.find((c) => c.id === e.course_id)?.title
                if (title) studentMap.get(e.user_id).courses.push(title)
            }

            const studentIds = Array.from(studentMap.keys())
            let txs = []
            if (studentIds.length > 0) {
                const { data: txData, error: txErr } = await supabase
                    .from('transactions')
                    .select('id, user_id, amount_paid, status, discount_applied, created_at, packages ( name )')
                    .in('user_id', studentIds)
                    .order('created_at', { ascending: false })
                if (txErr) { setError(txErr.message); setLoading(false); return }
                txs = txData ?? []
            }

            const latestPlan = new Map()
            for (const tx of txs) {
                if (tx.status === 'completed' && !latestPlan.has(tx.user_id)) latestPlan.set(tx.user_id, tx)
            }

            setClients(Array.from(studentMap.values()).map((c) => ({ ...c, plan: latestPlan.get(c.id) ?? null })))
            setTransactions(txs.map((tx) => ({ ...tx, client: studentMap.get(tx.user_id) })))
            setLoading(false)
        }

        load()
    }, [user, role])

    if (loading) return <div className="page-loading">Loading your dashboard...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="dashboard-page">
            <div className="page-hero">
                <span className="eyebrow">Your Dashboard</span>
                <h1>Welcome, {profile?.full_name || 'Trainer'}</h1>
                <p>View your classes, track your clients, and see their billing status.</p>
            </div>

            {noTrainerRow && (
                <p className="page-error">
                    Your account has the trainer role but is not linked to a trainer profile yet. Ask an admin to link it (Admin Dashboard → Trainers).
                </p>
            )}

            <div className="admin-tabs">
                {['Classes', 'Clients', 'Billing'].map((t) => (
                    <button key={t} className={`btn ${tab === t ? 'primary' : 'secondary'}`} onClick={() => setTab(t)}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Classes' && (
                <section>
                    <h2>Your Classes ({courses.length})</h2>
                    {courses.length === 0 ? (
                        <p>You haven't been assigned any courses yet. Ask an admin to link one to you.</p>
                    ) : (
                        <div className="courses-grid">
                            {courses.map((c) => (
                                <div key={c.id} className="course-card">
                                    {c.level && <span className="course-difficulty">{c.level}</span>}
                                    <h3>{c.title}</h3>
                                    <p>{c.description}</p>
                                    {c.schedule_day && (
                                        <p className="course-trainer">{[c.schedule_day, c.schedule_time].filter(Boolean).join(' · ')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {tab === 'Clients' && (
                <section>
                    <h2>Your Clients ({clients.length})</h2>
                    {clients.length === 0 ? (
                        <p>No members have enrolled in your classes yet.</p>
                    ) : (
                        <table className="invoice-table">
                            <thead>
                            <tr><th>Name</th><th>Email</th><th>Enrolled In</th><th>Membership</th></tr>
                            </thead>
                            <tbody>
                            {clients.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.full_name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.courses.join(', ')}</td>
                                    <td>{c.plan ? `${c.plan.packages?.name ?? 'Plan'} (R${c.plan.amount_paid})` : 'None active'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            {tab === 'Billing' && (
                <section>
                    <h2>Client Billing ({transactions.length})</h2>
                    {transactions.length === 0 ? (
                        <p>No transactions found for your clients yet.</p>
                    ) : (
                        <table className="invoice-table">
                            <thead>
                            <tr><th>Client</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td>{tx.client?.full_name} ({tx.client?.email})</td>
                                    <td>{tx.packages?.name || '—'}</td>
                                    <td>R{tx.amount_paid}</td>
                                    <td>{tx.status}</td>
                                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}
        </div>
    )
}

export default TrainerDashboard