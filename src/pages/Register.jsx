import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import api from '../services/api'

export default function Register() {
  const [params] = useSearchParams()

  const type = params.get('type')
  const id = params.get('id')

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
  })

  // --------------------------------------------------
  // LOAD EVENT / PROGRAM
  // --------------------------------------------------

  useEffect(() => {
    const loadItem = async () => {
      if (!type || !id) {
        setError('Invalid registration link.')
        setLoading(false)
        return
      }

      if (!['event', 'program'].includes(type)) {
        setError('Invalid registration type.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const resource =
          type === 'event'
            ? 'events'
            : 'programs'

        const res = await api.get(`/${resource}/${id}`)

        /*
         * Supports both:
         *
         * { data: {...} }
         *
         * and
         *
         * {...}
         */

        const data = res.data?.data || res.data

        setItem(data)
      } catch (err) {
        console.error(
          'Failed to load registration item:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load this event or program.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [type, id])

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // --------------------------------------------------
  // SUBMIT REGISTRATION REQUEST
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!item) {
      setError(
        'Unable to identify the selected event or program.'
      )
      return
    }

    if (!form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!form.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.post('/registrations', {
        name: form.fullName.trim(),
        email: form.email.trim(),
        type,
        id,
      })

      setSubmitted(true)
    } catch (err) {
      console.error(
        'Registration failed:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to send the registration link. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // DISPLAY DATA
  // --------------------------------------------------

  const itemTitle =
    item?.title ||
    'AMRI Registration'

  const itemType =
    type === 'program'
      ? 'Program'
      : 'Event'

  const backPath =
    type === 'program'
      ? '/programs'
      : '/events'

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <>
      <PageHero
        eyebrow="Registration"
        title="Register your interest"
        description="Enter your details and we will send the registration link to your email."
        symbol="✓"
      />

      <section className="bg-paper">
        <div className="max-w-lg mx-auto px-6 py-20">

          <div className="border border-ink/15 bg-paper p-8">

            {/* ---------------------------------------- */}
            {/* LOADING */}
            {/* ---------------------------------------- */}

            {loading && (
              <div className="text-center py-10">
                <p className="text-sm text-ink-soft">
                  Loading registration details...
                </p>
              </div>
            )}

            {/* ---------------------------------------- */}
            {/* ERROR - ITEM NOT FOUND */}
            {/* ---------------------------------------- */}

            {!loading && error && !item && (
              <div className="text-center py-10">

                <p className="text-red-600 text-sm">
                  {error}
                </p>

                <Link
                  to={backPath}
                  className="btn-ink inline-flex mt-6 px-6 py-2.5 text-xs"
                >
                  Back to {itemType}s
                </Link>

              </div>
            )}

            {/* ---------------------------------------- */}
            {/* ITEM */}
            {/* ---------------------------------------- */}

            {!loading && item && (
              <>
                <p className="eyebrow text-pen mb-2">
                  Registration · {itemType}
                </p>

                <h3 className="font-display text-2xl font-semibold">
                  {itemTitle}
                </h3>

                {/* SHORT DESCRIPTION */}

                {item.shortDescription && (
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                    {item.shortDescription}
                  </p>
                )}

                {/* ------------------------------------ */}
                {/* SUCCESS */}
                {/* ------------------------------------ */}

                {submitted ? (
                  <div className="text-center py-8">

                    <div className="font-display text-xl text-pen">
                      Registration link sent
                    </div>

                    <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                      Thank you, {form.fullName}.
                    </p>

                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                      We have sent the registration link for
                      <strong> {itemTitle}</strong> to
                      <strong> {form.email}</strong>.
                    </p>

                    <p className="mt-3 text-xs text-ink-soft">
                      Please check your inbox and spam folder.
                    </p>

                    <Link
                      to={backPath}
                      className="btn-ink inline-flex mt-7 px-6 py-2.5 text-xs"
                    >
                      Back to {itemType}s
                    </Link>

                  </div>
                ) : (

                  /* ---------------------------------- */
                  /* FORM */
                  /* ---------------------------------- */

                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                  >

                    {/* FORM ERROR */}

                    {error && (
                      <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {/* NAME */}

                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2"
                      >
                        Full name
                      </label>

                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        autoComplete="name"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="
                          w-full
                          border
                          border-ink/20
                          px-4
                          py-3
                          bg-paper
                          text-ink
                          focus:outline-none
                          focus:border-pen
                        "
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="
                          w-full
                          border
                          border-ink/20
                          px-4
                          py-3
                          bg-paper
                          text-ink
                          focus:outline-none
                          focus:border-pen
                        "
                      />
                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="
                        btn-gold
                        w-full
                        py-3
                        text-sm
                        mt-2
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {submitting
                        ? 'Sending registration link...'
                        : 'Send Registration Link'}
                    </button>

                    <p className="text-center text-xs text-ink-soft">
                      Your registration link will be sent to
                      the email address above.
                    </p>

                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </section>
    </>
  )
}