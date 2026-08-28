import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const apiUrl = (
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
      ).replace(/\/+$/, '')

      const baseUrl = apiUrl.endsWith('/api')
        ? apiUrl
        : `${apiUrl}/api`

      const response = await fetch(
        `${baseUrl}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setSubmitted(true)

      setForm({
        name: '',
        email: '',
        message: '',
      })
    } catch (err) {
      console.error('Contact form error:', err)

      setError(
        err.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch with AMRI"
        symbol="@"
      />

      <section className="bg-paper">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14">

          <div>
            <h3 className="font-display text-xl font-semibold mb-4">
              Details
            </h3>

            <ul className="space-y-3 text-sm text-ink-soft">
              <li>
                <span className="font-mono text-xs uppercase text-pen block mb-0.5">
                  Email
                </span>
                amrimathematics@gmail.com
              </li>

              <li>
                <span className="font-mono text-xs uppercase text-pen block mb-0.5">
                  Location
                </span>
                8, SMP nagar, coimbatore, Tamil Nadu, 642109
              </li>

              <li>
                <span className="font-mono text-xs uppercase text-pen block mb-0.5">
                  Social
                </span>
                LinkedIn · YouTube
              </li>
            </ul>
          </div>

          <div>
            {submitted ? (
              <div>
                <p className="text-pen mb-4">
                  Message sent — we'll respond within two business days.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-ink px-5 py-2 text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">
                    Name
                  </label>

                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-ink/20 px-4 py-2.5 bg-paper focus:outline-none focus:border-pen"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">
                    Email
                  </label>

                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-ink/20 px-4 py-2.5 bg-paper focus:outline-none focus:border-pen"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">
                    Message
                  </label>

                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full border border-ink/20 px-4 py-2.5 bg-paper focus:outline-none focus:border-pen"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ink w-full py-3 text-sm mt-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </>
  )
}