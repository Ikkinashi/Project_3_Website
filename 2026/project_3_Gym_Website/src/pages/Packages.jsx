import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Packages.css'

function Packages() {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchPackages() {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .order('price', { ascending: true })

            if (error) setError(error.message)
            else setPackages(data)
            setLoading(false)
        }

        fetchPackages()
    }, [])

    if (loading) return <div className="page-loading">Loading packages...</div>
    if (error) return <div className="page-error">Error: {error}</div>

    return (
        <div className="packages-page">
            <div className="page-hero">
                <span className="eyebrow">Membership</span>
                <h1>Packages</h1>
                <p>Flexible plans built around your schedule and budget.</p>
            </div>

            {packages.length === 0 ? (
                <p>No packages available yet.</p>
            ) : (
                <div className="packages-grid">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="package-card">
                            <h3>{pkg.name}</h3>
                            <p className="package-price">R{pkg.price} / {pkg.billing_period}</p>
                            <p>{pkg.description}</p>
                            {pkg.features && (
                                <ul className="package-features">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            )}
                            <button className="btn primary">Choose Plan</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Packages