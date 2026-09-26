import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import '../styles/Billing.css'

function Billing() {
    const { user } = useAuth()
    const [subscription, setSubscription] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) return

        async function fetchBilling() {
            const [subResult, invoiceResult] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('*, packages ( name, price, billing_period )')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle(),
                supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
            ])

            if (subResult.error) {
                setError(subResult.error.message)
            } else {
                setSubscription(subResult.data)
            }

            if (invoiceResult.data) {
                setInvoices(invoiceResult.data)
            }

            setLoading(false)
        }

        fetchBilling()
    }, [user])

    if (loading) return <div className="page-loading">Loading billing info...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="billing-page">
            <h1>Billing</h1>

            <section className="current-plan">
                <h2>Current Plan</h2>
                {subscription ? (
                    <div className="plan-card">
                        <h3>{subscription.packages?.name}</h3>
                        <p>R{subscription.packages?.price} / {subscription.packages?.billing_period}</p>
                        <p>Status: {subscription.status}</p>
                        <p>Renews: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <p>You don't have an active subscription. <a href="/packages">View packages</a>.</p>
                )}
            </section>

            <section className="invoice-history">
                <h2>Invoice History</h2>
                {invoices.length === 0 ? (
                    <p>No invoices yet.</p>
                ) : (
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                                <td>R{invoice.amount}</td>
                                <td>{invoice.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}

export default Billing