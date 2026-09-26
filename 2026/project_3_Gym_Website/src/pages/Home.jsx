import '../styles/Home.css'

function Home() {
    return (
        <div className="home">
            <section className="hero">
                <h1>Forge Fitness</h1>
                <p>Train harder. Recover smarter. Build the body you deserve.</p>
                <div className="hero-actions">
                    <button className="btn primary">Start Free Trial</button>
                    <button className="btn secondary">View Plans</button>
                </div>
            </section>

            <section className="features">
                <div className="feature-card">
                    <h3>Expert Trainers</h3>
                    <p>Certified coaches guiding every step of your journey.</p>
                </div>
                <div className="feature-card">
                    <h3>Modern Equipment</h3>
                    <p>Top-tier gear for strength, cardio, and recovery.</p>
                </div>
                <div className="feature-card">
                    <h3>Flexible Plans</h3>
                    <p>Packages built around your schedule and your goals.</p>
                </div>
            </section>

            <section className="stats">
                <div className="stat">
                    <h2>500+</h2>
                    <p>Active Members</p>
                </div>
                <div className="stat">
                    <h2>15</h2>
                    <p>Expert Trainers</p>
                </div>
                <div className="stat">
                    <h2>10+</h2>
                    <p>Years Running</p>
                </div>
                <div className="stat">
                    <h2>24/7</h2>
                    <p>Gym Access</p>
                </div>
            </section>
        </div>
    )
}

export default Home