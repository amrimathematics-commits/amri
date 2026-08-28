import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import Button from '../components/Button.jsx'
import { Code2, Activity, Layers, Database } from 'lucide-react'
import { researchService } from '../services/contentService'

const tools = [
  { icon: Code2, name: 'Python' },
  { icon: Activity, name: 'MATLAB' },
  { icon: Layers, name: 'Desmos graphing calculator' },
  { icon: Database, name: 'GeoGebra' },
]

export default function Research() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadResearch = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await researchService.getPublished({ limit: 100 })

        console.log('Research API response:', res)

        setAreas(res.data || [])
      } catch (err) {
        console.error('Failed to load research:', err)
        setError('Unable to load research areas.')
      } finally {
        setLoading(false)
      }
    }

    loadResearch()
  }, [])

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}
      <PageHero
        eyebrow="Research"
        title="Six areas. One shared language."
        description="From pure theory to applied computation, AMRI's research spans the full breadth of modern mathematics."
        symbol="λ"
      />

      {/* =====================================================
          RESEARCH AREAS
      ====================================================== */}
      <section className="bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">

          {/* LOADING */}
          {loading && (
            <p className="text-center text-ink-soft">
              Loading research areas...
            </p>
          )}

          {/* ERROR */}
          {!loading && error && (
            <p className="text-center text-red-600">
              {error}
            </p>
          )}

          {/* EMPTY */}
          {!loading && !error && areas.length === 0 && (
            <p className="text-center text-ink-soft">
              No published research areas available at the moment.
            </p>
          )}

          {/* =================================================
              RESEARCH CARDS
          ================================================== */}
          {!loading && !error && areas.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">

              {areas.map((area) => {
                /*
                 * Support both possible backend field names.
                 * This prevents the full description from disappearing
                 * if the backend/model uses description instead of
                 * fullDescription.
                 */
                const fullDescription =
                  area.fullDescription ||
                  area.description ||
                  area.text ||
                  area.content ||
                  ''

                return (
                  <article
                    key={area._id || area.id || area.title}
                    className="
                      group
                      overflow-hidden
                      border
                      border-ink/15
                      bg-paper
                      transition-all
                      duration-300
                      hover:border-pen
                      hover:shadow-sm
                    "
                  >

                    {/* =================================================
                        IMAGE
                    ================================================== */}
                    {area.image && (
                      <div className="overflow-hidden bg-ink/5">
                        <img
                          src={area.image}
                          alt={area.title || 'AMRI research area'}
                          className="
                            w-full
                            h-56
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.02]
                          "
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display =
                              'none'
                          }}
                        />
                      </div>
                    )}

                    {/* =================================================
                        CONTENT
                    ================================================== */}
                    <div className="p-6">

                      {/* CATEGORY */}
                      {(area.category || area.tag) && (
                        <p className="font-mono text-xs uppercase tracking-wider text-pen">
                          {area.category || area.tag}
                        </p>
                      )}

                      {/* TITLE */}
                      {area.title && (
                        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                          {area.title}
                        </h3>
                      )}

                      {/* SHORT DESCRIPTION */}
                      {area.shortDescription && (
                        <p className="mt-3 text-base text-ink-soft leading-relaxed">
                          {area.shortDescription}
                        </p>
                      )}

                      {/* =================================================
                          FULL DESCRIPTION
                      ================================================== */}
                      {fullDescription && (
                        <div className="mt-5 pt-5 border-t border-ink/10">
                          <p className="
                            text-sm
                            text-ink-soft
                            leading-7
                            whitespace-pre-line
                          ">
                            {fullDescription}
                          </p>
                        </div>
                      )}

                      {/* =================================================
                          CATEGORY / DEPARTMENT / RESEARCH AREA
                      ================================================== */}
                      {(area.category ||
                        area.department ||
                        area.researchArea) && (
                        <div className="
                          mt-6
                          pt-5
                          border-t
                          border-ink/10
                          space-y-2
                        ">

                          {area.category && (
                            <div className="text-sm">
                              <span className="font-semibold text-ink">
                                Category:
                              </span>{' '}
                              <span className="text-ink-soft">
                                {area.category}
                              </span>
                            </div>
                          )}

                          {area.department && (
                            <div className="text-sm">
                              <span className="font-semibold text-ink">
                                Department:
                              </span>{' '}
                              <span className="text-ink-soft">
                                {area.department}
                              </span>
                            </div>
                          )}

                          {area.researchArea && (
                            <div className="text-sm">
                              <span className="font-semibold text-ink">
                                Research Area:
                              </span>{' '}
                              <span className="text-ink-soft">
                                {area.researchArea}
                              </span>
                            </div>
                          )}

                        </div>
                      )}

                      {/* =================================================
                          AUTHORS
                      ================================================== */}
                      {area.authors && (
                        <div className="mt-5 text-sm text-ink-soft">
                          <span className="font-semibold text-ink">
                            Authors:
                          </span>{' '}

                          {Array.isArray(area.authors)
                            ? area.authors.join(', ')
                            : area.authors}
                        </div>
                      )}

                      {/* =================================================
                          PUBLICATION DATE
                      ================================================== */}
                      {area.publicationDate && (
                        <div className="mt-2 text-xs text-ink-soft">
                          <span className="font-semibold text-ink">
                            Published:
                          </span>{' '}

                          {new Date(
                            area.publicationDate
                          ).toLocaleDateString('en-GB')}
                        </div>
                      )}

                      {/* =================================================
                          DOCUMENT / EXTERNAL LINKS
                      ================================================== */}
                      {(area.documentUrl || area.externalUrl) && (
                        <div className="mt-6 flex flex-wrap gap-5">

                          {area.documentUrl && (
                            <a
                              href={area.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                text-sm
                                font-medium
                                text-pen
                                hover:underline
                              "
                            >
                              View Document →
                            </a>
                          )}

                          {area.externalUrl && (
                            <a
                              href={area.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                text-sm
                                font-medium
                                text-pen
                                hover:underline
                              "
                            >
                              External Link →
                            </a>
                          )}

                        </div>
                      )}

                    </div>
                  </article>
                )
              })}

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          COMPUTATIONAL MATHEMATICS & TOOLS
      ====================================================== */}
      <section className="chalk-board text-chalk">
        <div className="max-w-4xl mx-auto px-6 py-20">

          <h2 className="font-display text-3xl font-semibold">
            Computational Mathematics &amp; Tools
          </h2>

          <p className="mt-4 text-chalk/75 leading-relaxed max-w-2xl">
            At AMRI, we leverage powerful computational tools to solve complex
            mathematical problems. Our research methodology heavily relies on:
          </p>

          {/* TOOLS */}
          <div className="mt-10 grid sm:grid-cols-2 gap-5">

            {tools.map(({ icon: Icon, name }) => (
              <div
                key={name}
                className="
                  flex
                  items-center
                  gap-4
                  border
                  border-chalk/20
                  px-6
                  py-5
                  hover:border-gold
                  transition-colors
                "
              >
                <Icon
                  className="w-5 h-5 text-gold shrink-0"
                  strokeWidth={2}
                />

                <span className="font-mono text-sm uppercase tracking-wider">
                  {name}
                </span>
              </div>
            ))}

          </div>

          <p className="mt-10 text-chalk/75 leading-relaxed max-w-2xl">
            These tools allow us to perform advanced simulations, data analysis
            and mathematical modeling — turning abstract theories into visual
            and tangible results.
          </p>

        </div>
      </section>

      {/* =====================================================
          COLLABORATION
      ====================================================== */}
      <section className="bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">

          <div className="mt-16 text-center">

            <p className="text-ink-soft mb-6">
              Want to collaborate on a research project or join a working group?
            </p>

            <Button to="/contact" variant="ink">
              Get in touch →
            </Button>

          </div>

        </div>
      </section>
    </>
  )
}