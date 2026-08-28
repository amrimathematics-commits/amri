import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'

const tiers = [
  {
    name: 'Student',
    text: 'For students exploring mathematical research.',
    points: [
      'Access to workshops',
      'Young Researchers network',
      'Newsletter',
    ],
  },
  {
    name: 'Research Scholar',
    text: 'For active scholars and PhD candidates.',
    points: [
      'Research training',
      'Conference discounts',
      'Collaboration matching',
    ],
  },
  {
    name: 'Faculty & Professional',
    text: 'For faculty members and industry professionals.',
    points: [
      'FDP priority access',
      'Industry–academia network',
      'Speaking opportunities',
    ],
  },
]

export default function Membership() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    membershipType: 'Student',
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/membership`,
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
        throw new Error(
          data.message || 'Failed to submit application'
        )
      }

      setSubmitted(true)

      setForm({
        name: '',
        email: '',
        membershipType: 'Student',
      })
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Become a member"
        description="Be part of a growing mathematical research community — connect, collaborate, create."
        symbol="+"
      />

      <section className="bg-paper">
        <div className="max-w-5xl mx-auto px-6 py-20">

          <div className="grid sm:grid-cols-3 gap-5 mb-20">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="border border-ink/15 p-6"
              >
                <h3 className="font-display text-lg font-semibold">
                  {t.name}
                </h3>

                <p className="mt-2 text-sm text-ink-soft">
                  {t.text}
                </p>

                <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
                  {t.points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2"
                    >
                      <span className="text-gold">·</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-lg mx-auto border border-ink/15 p-8">

            <h3 className="font-display text-2xl font-semibold mb-6 text-center">
              Join AMRI today
            </h3>

            {submitted ? (
              <div className="text-center">

                <p className="text-pen mb-5">
                  Thanks for your interest — a membership
                  coordinator will reach out to the email
                  you provided shortly.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-gold px-5 py-2.5 text-sm"
                >
                  Submit another application
                </button>

              </div>
            ) : (

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">
                    Full name
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
                    I am a
                  </label>

                  <select
                    name="membershipType"
                    value={form.membershipType}
                    onChange={handleChange}
                    className="w-full border border-ink/20 px-4 py-2.5 bg-paper focus:outline-none focus:border-pen"
                  >
                    <option value="Student">
                      Student
                    </option>

                    <option value="Research Scholar">
                      Research Scholar
                    </option>

                    <option value="Faculty Member">
                      Faculty Member
                    </option>

                    <option value="Professional">
                      Professional
                    </option>
                  </select>
                </div>

                {error && (
                  <p className="text-red-600 text-sm">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3 text-sm mt-2 disabled:opacity-50"
                >
                  {loading
                    ? 'Submitting...'
                    : 'Submit application'}
                </button>

              </form>
            )}

          </div>
        </div>
      </section>
    </>
  )
}