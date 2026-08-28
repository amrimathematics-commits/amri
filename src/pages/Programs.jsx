import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import Button from '../components/Button.jsx'
import { Link } from 'react-router-dom'
import { programService } from '../services/contentService'

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await programService.getPublished({
          limit: 100,
        })

        setPrograms(res.data || [])
      } catch (err) {
        console.error('Failed to load programs:', err)
        setError('Unable to load programs.')
      } finally {
        setLoading(false)
      }
    }

    loadPrograms()
  }, [])

  return (
    <>
      {/* HERO */}
      <PageHero
        eyebrow="Programs & Initiatives"
        title="Structured pathways for every stage of a research career"
        description="AMRI programs connect mathematical foundations, research methods, innovation and real-world applications."
        symbol="G(V,E)"
      />

      {/* PROGRAMS */}
      <section className="bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">

          {/* LOADING */}
          {loading && (
            <p className="text-center text-ink-soft">
              Loading programs...
            </p>
          )}

          {/* ERROR */}
          {error && (
            <p className="text-center text-red-600">
              {error}
            </p>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            programs.length === 0 && (
              <p className="text-center text-ink-soft">
                No published programs available at the moment.
              </p>
            )}

          {/* PROGRAM CARDS */}
          {!loading &&
            !error &&
            programs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">

                {programs.map((program) => {
                  const programId =
                    program._id || program.id

                  return (
                    <article
                      key={
                        programId ||
                        program.title
                      }
                      className="border border-ink/15 bg-white overflow-hidden hover:border-pen transition-colors"
                    >

                      {/* IMAGE */}
                      {program.image && (
                        <div className="w-full overflow-hidden">
                          <img
                            src={program.image}
                            alt={
                              program.title ||
                              'AMRI program'
                            }
                            className="w-full h-64 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              console.error(
                                'Program image failed to load:',
                                program.image
                              )

                              e.currentTarget.parentElement.style.display =
                                'none'
                            }}
                          />
                        </div>
                      )}

                      <div className="p-8">

                        {/* CATEGORY */}
                        {(program.category ||
                          program.tag) && (
                          <p className="font-mono text-xs uppercase tracking-wider text-pen">
                            {program.category ||
                              program.tag}
                          </p>
                        )}

                        {/* TITLE */}
                        {program.title && (
                          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                            {program.title}
                          </h3>
                        )}

                        {/* SUBTITLE */}
                        {(program.subtitle ||
                          program.shortTitle) && (
                          <p className="mt-2 text-sm font-medium text-ink-soft">
                            {program.subtitle ||
                              program.shortTitle}
                          </p>
                        )}

                        {/* SHORT DESCRIPTION */}
                        {(program.shortDescription ||
                          program.summary ||
                          program.text) && (
                          <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                            {program.shortDescription ||
                              program.summary ||
                              program.text}
                          </p>
                        )}

                        {/* FULL DESCRIPTION */}
                        {program.description && (
                          <div className="mt-6 pt-5 border-t border-ink/10">

                            <h4 className="font-display text-lg font-semibold text-ink">
                              About this program
                            </h4>

                            <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                              {program.description}
                            </p>

                          </div>
                        )}

                        {/* DEPARTMENT */}
                        {program.department && (
                          <div className="mt-5 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Department:
                            </span>{' '}
                            {program.department}
                          </div>
                        )}

                        {/* PROGRAM TYPE */}
                        {program.programType && (
                          <div className="mt-2 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Type:
                            </span>{' '}
                            {program.programType}
                          </div>
                        )}

                        {/* DURATION */}
                        {program.duration && (
                          <div className="mt-2 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Duration:
                            </span>{' '}
                            {program.duration}
                          </div>
                        )}

                        {/* ELIGIBILITY */}
                        {program.eligibility && (
                          <div className="mt-5 pt-5 border-t border-ink/10">

                            <h4 className="font-display text-base font-semibold text-ink">
                              Eligibility
                            </h4>

                            <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                              {program.eligibility}
                            </p>

                          </div>
                        )}

                        {/* OBJECTIVES */}
                        {program.objectives && (
                          <div className="mt-5">

                            <h4 className="font-display text-base font-semibold text-ink">
                              Objectives
                            </h4>

                            {Array.isArray(
                              program.objectives
                            ) ? (
                              <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-ink-soft">

                                {program.objectives.map(
                                  (
                                    objective,
                                    index
                                  ) => (
                                    <li key={index}>
                                      {typeof objective ===
                                      'string'
                                        ? objective
                                        : objective.name ||
                                          objective.title ||
                                          ''}
                                    </li>
                                  )
                                )}

                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {program.objectives}
                              </p>
                            )}

                          </div>
                        )}

                        {/* COORDINATOR */}
                        {program.coordinator && (
                          <div className="mt-4 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Coordinator:
                            </span>{' '}
                            {program.coordinator}
                          </div>
                        )}

                        {/* CONTACT */}
                        {program.contact && (
                          <div className="mt-2 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Contact:
                            </span>{' '}
                            {program.contact}
                          </div>
                        )}

                        {/* DOCUMENT LINK */}
                        {program.documentUrl && (
                          <div className="mt-6">

                            <a
                              href={program.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-pen hover:underline"
                            >
                              View Document →
                            </a>

                          </div>
                        )}

                        {/* EXTERNAL INFORMATION LINK */}
                        {program.externalUrl && (
                          <div className="mt-3">

                            <a
                              href={program.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-pen hover:underline"
                            >
                              More Information →
                            </a>

                          </div>
                        )}

                        {/* ACTIONS */}
                        {programId && (
                          <div className="mt-7 pt-6 border-t border-ink/10 flex flex-wrap gap-3">

                            {/* REGISTER THROUGH AMRI */}
                            <Link
                              to={`/register?type=program&id=${programId}`}
                              className="btn-ink inline-flex items-center justify-center px-6 py-3 text-xs"
                            >
                              Register now →
                            </Link>

                            {/* LEARN MORE */}
                            <Link
                              to={`/programs/${programId}`}
                              className="inline-flex items-center justify-center border border-ink/20 px-6 py-3 text-xs font-medium text-ink hover:border-pen transition-colors"
                            >
                              Learn more →
                            </Link>

                          </div>
                        )}

                      </div>
                    </article>
                  )
                })}

              </div>
            )}

          {/* BOTTOM CTA */}
          <div className="mt-16 text-center">

            <p className="text-ink-soft mb-6">
              Ready to register for an upcoming programme?
            </p>

            <div className="flex flex-wrap justify-center gap-4">

              <Button
                to="/events"
                variant="ink"
              >
                View events →
              </Button>

              <Link
                to="/register"
                className="btn-gold inline-flex items-center px-6 py-3 text-sm"
              >
                Register now
              </Link>

            </div>

          </div>

        </div>
      </section>
    </>
  )
}