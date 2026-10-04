function About() {
  return (
    <div className="about-page">
      <div className="page-hero">
        <span className="eyebrow">Our Story</span>
        <h1>About Forge Fitness</h1>
        <p>
          We're a Cape Town gym built on the belief that discipline and community
          create lasting change. Founded over a decade ago, we've grown into a full
          training facility with expert coaches and a program for every goal.
        </p>
      </div>

      <div className="about-content">
        <div className="about-block">
          <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.75rem' }}>🎯</span>
          <h3>Our Mission</h3>
          <p>
            To give every member — beginner or elite athlete — the tools,
            guidance, and environment they need to become their strongest self.
          </p>
        </div>
        <div className="about-block">
          <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.75rem' }}>🏢</span>
          <h3>Our Facility</h3>
          <p>
            A full floor of strength and cardio equipment, dedicated class studios,
            and a recovery suite, all maintained to the highest standard.
          </p>
        </div>
        <div className="about-block">
          <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.75rem' }}>👥</span>
          <h3>Our Coaches</h3>
          <p>
            Certified trainers specializing in strength, conditioning, mobility,
            and nutrition — here to build a plan around your goals.
          </p>
        </div>
        <div className="about-block">
          <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.75rem' }}>🎓</span>
          <h3>Student Friendly</h3>
          <p>
            We believe fitness should be accessible to everyone. That's why we offer
            exclusive discounted membership rates for verified students.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About