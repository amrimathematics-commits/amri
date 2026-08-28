import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import Button from '../components/Button.jsx'
import { innovationService } from '../services/contentService'

const defaultDomains = [
  'Healthcare',
  'AI & ML',
  'Agriculture',
  'Networks',
]

export default function Innovation() {
  const [innovations, setInnovations] = useState([])
  const [domains, setDomains] = useState(defaultDomains)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInnovations = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await innovationService.getPublished({
            limit: 100,
          })

        console.log(
          'PUBLIC INNOVATIONS RESPONSE:',
          response
        )

        /*
         * Handle both possible API response shapes:
         *
         * { data: [...] }
         *
         * OR
         *
         * { data: { data: [...] } }
         */

        let data = []

        if (Array.isArray(response?.data)) {
          data = response.data
        } else if (
          Array.isArray(response?.data?.data)
        ) {
          data = response.data.data
        }

        console.log(
          'PUBLIC INNOVATIONS DATA:',
          data
        )

        setInnovations(data)

        const dynamicDomains = data
          .map(
            (item) =>
              item.domain ||
              item.category ||
              item.tag
          )
          .filter(Boolean)

        if (dynamicDomains.length > 0) {
          setDomains([
            ...new Set(dynamicDomains),
          ])
        }
      } catch (err) {
        console.error(
          'Failed to load innovations:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load innovations.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadInnovations()
  }, [])

  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <PageHero
        eyebrow="Innovation"
        title="From mathematical ideas to real-world impact"
        description="Mathematical innovation applied across healthcare, AI, agriculture and network science."
        symbol="↗"
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="bg-paper">
        <div className="max-w-5xl mx-auto px-6 py-20">

          {/* =================================================
              DOMAINS
          ================================================= */}

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {domains.map((domain) => (
              <span
                key={domain}
                className="border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-soft"
              >
                {domain}
              </span>
            ))}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <p className="text-center text-ink-soft">
              Loading innovations...
            </p>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <p className="text-center text-red-600">
              {error}
            </p>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            innovations.length === 0 && (
              <div className="text-center">
                <p className="text-ink-soft">
                  No published innovations
                  available at the moment.
                </p>
              </div>
            )}

          {/* =================================================
              INNOVATION CARDS
          ================================================= */}

          {!loading &&
            !error &&
            innovations.length > 0 && (
              <div className="space-y-10">

                {innovations.map(
                  (innovation, index) => {
                    const id =
                      innovation._id ||
                      innovation.id ||
                      innovation.title ||
                      index

                    return (
                      <article
                        key={id}
                        className="border border-ink/15 bg-white overflow-hidden"
                      >

                        {/* =================================
                            IMAGE
                        ================================= */}

                        {innovation.image && (
                          <div className="w-full bg-gray-100 overflow-hidden">
                            <img
                              src={innovation.image}
                              alt={
                                innovation.title ||
                                'AMRI innovation'
                              }
                              className="block w-full h-72 md:h-96 object-cover"
                              loading="lazy"
                              onError={(e) => {
                                console.error(
                                  'Innovation image failed:',
                                  innovation.image
                                )

                                e.currentTarget.parentElement.style.display =
                                  'none'
                              }}
                            />
                          </div>
                        )}

                        {/* =================================
                            CONTENT
                        ================================= */}

                        <div className="p-8">

                          {/* DOMAIN / CATEGORY */}

                          {(innovation.domain ||
                            innovation.category ||
                            innovation.tag) && (
                            <p className="font-mono text-xs uppercase tracking-wider text-pen">
                              {innovation.domain ||
                                innovation.category ||
                                innovation.tag}
                            </p>
                          )}

                          {/* TITLE */}

                          {innovation.title && (
                            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                              {innovation.title}
                            </h2>
                          )}

                          {/* SHORT DESCRIPTION */}

                          {innovation.shortDescription && (
                            <p className="mt-4 text-base text-ink-soft leading-relaxed">
                              {
                                innovation.shortDescription
                              }
                            </p>
                          )}

                          {/* DESCRIPTION */}

                          {innovation.description && (
                            <div className="mt-6">
                              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {
                                  innovation.description
                                }
                              </p>
                            </div>
                          )}

                          {/* FULL DESCRIPTION */}

                          {innovation.fullDescription && (
                            <div className="mt-6 pt-6 border-t border-ink/10">
                              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {
                                  innovation.fullDescription
                                }
                              </p>
                            </div>
                          )}

                          {/* =================================
                              DETAILS
                          ================================= */}

                          {(innovation.department ||
                            innovation.technology ||
                            innovation.innovators) && (
                            <div className="mt-8 pt-6 border-t border-ink/10 space-y-4">

                              {/* DEPARTMENT */}

                              {innovation.department && (
                                <div>
                                  <p className="font-mono text-[11px] uppercase tracking-wider text-pen">
                                    Department
                                  </p>

                                  <p className="mt-1 text-sm text-ink-soft">
                                    {
                                      innovation.department
                                    }
                                  </p>
                                </div>
                              )}

                              {/* TECHNOLOGY */}

                              {innovation.technology &&
                                innovation.technology.length >
                                  0 && (
                                  <div>
                                    <p className="font-mono text-[11px] uppercase tracking-wider text-pen">
                                      Technologies
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {innovation.technology.map(
                                        (
                                          technology,
                                          techIndex
                                        ) => (
                                          <span
                                            key={
                                              techIndex
                                            }
                                            className="border border-ink/15 px-3 py-1 text-xs text-ink-soft"
                                          >
                                            {typeof technology ===
                                            'string'
                                              ? technology
                                              : technology?.name ||
                                                technology?.title ||
                                                ''}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* INNOVATORS */}

                              {innovation.innovators &&
                                innovation.innovators.length >
                                  0 && (
                                  <div>
                                    <p className="font-mono text-[11px] uppercase tracking-wider text-pen">
                                      Innovators
                                    </p>

                                    <p className="mt-1 text-sm text-ink-soft">
                                      {Array.isArray(
                                        innovation.innovators
                                      )
                                        ? innovation.innovators
                                            .map(
                                              (
                                                person
                                              ) =>
                                                typeof person ===
                                                'string'
                                                  ? person
                                                  : person?.name ||
                                                    person?.title ||
                                                    ''
                                            )
                                            .filter(
                                              Boolean
                                            )
                                            .join(
                                              ', '
                                            )
                                        : innovation.innovators}
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* =================================
                              PROBLEM
                          ================================= */}

                          {innovation.problemStatement && (
                            <div className="mt-8 pt-6 border-t border-ink/10">
                              <h3 className="font-display text-lg font-semibold text-ink">
                                Problem
                              </h3>

                              <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {
                                  innovation.problemStatement
                                }
                              </p>
                            </div>
                          )}

                          {/* =================================
                              SOLUTION
                          ================================= */}

                          {innovation.solution && (
                            <div className="mt-6">
                              <h3 className="font-display text-lg font-semibold text-ink">
                                Solution
                              </h3>

                              <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {
                                  innovation.solution
                                }
                              </p>
                            </div>
                          )}

                          {/* =================================
                              IMPACT
                          ================================= */}

                          {innovation.impact && (
                            <div className="mt-6">
                              <h3 className="font-display text-lg font-semibold text-ink">
                                Impact
                              </h3>

                              <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {innovation.impact}
                              </p>
                            </div>
                          )}

                          {/* =================================
                              GALLERY
                          ================================= */}

                          {Array.isArray(
                            innovation.gallery
                          ) &&
                            innovation.gallery.length >
                              0 && (
                              <div className="mt-8 pt-6 border-t border-ink/10">

                                <h3 className="font-display text-lg font-semibold text-ink">
                                  Gallery
                                </h3>

                                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                  {innovation.gallery.map(
                                    (
                                      image,
                                      galleryIndex
                                    ) => (
                                      <img
                                        key={
                                          galleryIndex
                                        }
                                        src={
                                          typeof image ===
                                          'string'
                                            ? image
                                            : image?.url
                                        }
                                        alt={`${innovation.title || 'Innovation'} gallery ${galleryIndex + 1}`}
                                        className="w-full h-56 object-cover border border-ink/10"
                                        loading="lazy"
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* =================================
                              LINKS
                          ================================= */}

                          {(innovation.videoUrl ||
                            innovation.externalUrl) && (
                            <div className="mt-8 pt-6 border-t border-ink/10 flex flex-wrap gap-5">

                              {innovation.videoUrl && (
                                <a
                                  href={
                                    innovation.videoUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-pen hover:underline"
                                >
                                  Watch Video →
                                </a>
                              )}

                              {innovation.externalUrl && (
                                <a
                                  href={
                                    innovation.externalUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-pen hover:underline"
                                >
                                  Learn More →
                                </a>
                              )}

                            </div>
                          )}

                        </div>
                      </article>
                    )
                  }
                )}

              </div>
            )}

          {/* =================================================
              IDEAS → MODELS → APPLICATIONS
          ================================================= */}

          <div className="grid sm:grid-cols-3 gap-6 text-center mt-20">

            <div>
              <p className="font-display text-3xl text-gold">
                Ideas
              </p>

              <p className="mt-2 text-sm text-ink-soft">
                Theoretical mathematics as a
                starting point
              </p>
            </div>

            <div>
              <p className="font-display text-3xl text-gold">
                Models
              </p>

              <p className="mt-2 text-sm text-ink-soft">
                Formalized into computational
                and analytical models
              </p>
            </div>

            <div>
              <p className="font-display text-3xl text-gold">
                Applications
              </p>

              <p className="mt-2 text-sm text-ink-soft">
                Deployed to solve real
                interdisciplinary problems
              </p>
            </div>

          </div>

          {/* =================================================
              RESEARCH BUTTON
          ================================================= */}

          <div className="mt-16 text-center">
            <Button
              to="/research"
              variant="ink"
            >
              Explore the research behind it →
            </Button>
          </div>

        </div>
      </section>
    </>
  )
}