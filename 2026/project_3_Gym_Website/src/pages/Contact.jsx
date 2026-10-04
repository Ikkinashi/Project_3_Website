import { useState } from 'react'
import { supabase } from '../supabase/client'
import '../styles/Contact.css'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await supabase
      .from('contact_enquiries')
      .insert([{ name, email, message, status: 'new' }])

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="contact-page">
      <div className="page-hero">
        <span className="eyebrow">Get In Touch</span>
        <h1>Contact Us</h1>
        <p>Questions about membership, classes, or training plans? Send us a message and we'll get back to you within 24 hours.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info-cards">
          <div className="contact-info-card">
            <span className="contact-icon">📍</span>
            <h3>Our Locations</h3>
            <p>Cape Town CBD, Bellville, and Claremont. Visit any branch with your active membership.</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-icon">🕐</span>
            <h3>Operating Hours</h3>
            <p>Monday to Friday: 05:00 – 22:00<br />Saturday & Sunday: 07:00 – 18:00</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-icon">📧</span>
            <h3>Email Us</h3>
            <p>info@forgefitness.co.za<br />Response within 24 hours.</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send a Message</h2>
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">Message sent! We'll get back to you soon.</p>}

          <div className="field-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="field-group">
            <label>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="How can we help you?"
              required
            />
          </div>

          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact