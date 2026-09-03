import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { Link } from 'react-router-dom'
import {
  eventService,
  researchService,
  programService,
  innovationService,
} from '../services/contentService'

const whyAmri = [
  {
    symbol: '01',
    title: 'VISION',
    heading: 'Shaping the Future Through Mathematics',
    text: 'To build a globally connected mathematical community that advances excellence, innovation, and impactful research.',
  },
  {
    symbol: '02',
    title: 'MISSION',
    heading: 'Turning Knowledge into Impact',
    text: 'To foster research, collaboration, and interdisciplinary innovation by creating meaningful opportunities for learning, discovery, and professional growth.',
  },
  {
    symbol: '03',
    title: 'CORE VALUES',
    heading: 'Excellence. Integrity. Innovation.',
    text: 'We champion collaboration, curiosity, inclusivity, and impact, empowering individuals to explore ideas, create knowledge, and shape the future.',
  },
]

export default function Home() {
  const [events, setEvents] = useState([])
  const [researchAreas, setResearchAreas] = useState([])
  const [programs, setPrograms] = useState([])
  const [innovations, setInnovations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        setLoading(true)

        const [
          eventsRes,
          researchRes,
          programsRes,
          innovationsRes,
        ] = await Promise.all([
          eventService.getPublished({ limit: 3 }),
          researchService.getPublished({ limit: 6 }),
          programService.getPublished({ limit: 3 }),
          innovationService.getPublished({ limit: 20 }),
        ])

        setEvents(eventsRes.data || [])
        setResearchAreas(researchRes.data || [])
        setPrograms(programsRes.data || [])
        setInnovations(innovationsRes.data || [])
      } catch (error) {
        console.error(
          'Failed to load homepage content:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadHomeContent()
  }, [])

  /*
   * Get unique innovation domains/categories
   */
  const innovationDomains = [
    ...new Set(
      innovations
        .map(
          (item) =>
            item.domain ||
            item.category ||
            item.tag
        )
        .filter(Boolean)
    ),
  ]

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="chalk-board text-chalk relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.06] font-display text-[26vw] leading-none">
          &#8721;
        </div>

        <div className="max-w-5xl mx-auto px-6 py-28 sm:py-36 relative text-center">

          <p className="eyebrow text-gold mb-6">
            Association for Mathematics, Research and Innovation
          </p>

          <h1 className="font-display font-semibold text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Advancing mathematics.
            <br />

            <span className="italic font-normal">
              Inspiring research.
            </span>

            <br />

            Creating innovation.
          </h1>

          <p className="mt-7 text-chalk/75 max-w-xl mx-auto leading-relaxed">
            A platform for mathematical research, academic collaboration,
            innovation and interdisciplinary knowledge exchange.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

            <Button
              to="/membership"
              variant="gold"
            >
              Join AMRI
            </Button>

            <Button
              to="/programs"
              variant="chalk"
            >
              Explore programs
            </Button>

          </div>

          <p className="mt-14 font-display text-xl tracking-[0.3em] text-chalk/40">
            &#9670; &#8721; &#8747; &#955; G(V,E) &#8711; AI &#9670;
          </p>

        </div>
      </section>


      {/* =========================================================
          ABOUT PREVIEW
      ========================================================= */}
      <section className="paper-grid">

        <div className="max-w-3xl mx-auto px-6 py-24 text-center">

          <p className="eyebrow text-pen mb-4">
            About AMRI
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Connecting mathematical knowledge with research &amp; innovation
          </h2>

          <p className="mt-5 text-ink-soft leading-relaxed">
            AMRI is an academic platform dedicated to promoting mathematics,
            research, innovation and interdisciplinary collaboration among
            students, researchers, faculty members and professionals.
          </p>

          <div className="mt-8">

            <Button
              to="/about"
              variant="ink"
            >
              Learn more about AMRI →
            </Button>

          </div>

        </div>

      </section>

      {/* =========================================================
      WHY AMRI
      ========================================================= */}
      <section className="bg-paper border-y border-ink/10">

        <div className="max-w-6xl mx-auto px-6 py-24">

          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center mb-14">
            Why AMRI?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {whyAmri.map((item) => (

              <div
                key={item.title}
                className="border border-ink/15 p-7 hover:border-pen transition-colors"
              >

                <span className="font-mono text-xs tracking-widest text-gold">
                  {item.symbol}
                </span>

                <h3 className="mt-4 font-mono text-xs uppercase tracking-wider">
                  {item.title}
                </h3>

                <h4 className="mt-5 font-display text-xl font-semibold leading-snug">
                  {item.heading}
                </h4>

                <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          RESEARCH AREAS
      ========================================================= */}
      <section className="chalk-board text-chalk">

        <div className="max-w-6xl mx-auto px-6 py-24">

          <h2 className="font-display text-3xl font-semibold text-center mb-14">
            Research Areas
          </h2>

          {loading && (
            <p className="text-center text-chalk/70">
              Loading research areas...
            </p>
          )}

          {!loading && researchAreas.length === 0 && (
            <p className="text-center text-chalk/70">
              No published research areas available.
            </p>
          )}

          {!loading && researchAreas.length > 0 && (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {researchAreas.map((area) => (

                <div
                  key={
                    area._id ||
                    area.id ||
                    area.title
                  }
                  className="border border-chalk/20 p-6"
                >

                  <h3 className="font-mono text-xs uppercase tracking-wider text-gold">
                    {area.title}
                  </h3>

                  {area.description && (
                    <p className="mt-3 text-sm text-chalk/70">
                      {area.description}
                    </p>
                  )}

                  {Array.isArray(area.items) && (
                    <ul className="mt-3 space-y-1.5 text-sm text-chalk/80">

                      {area.items.map((item, index) => (

                        <li key={index}>
                          {typeof item === 'string'
                            ? item
                            : item.name ||
                              item.title ||
                              ''}
                        </li>

                      ))}

                    </ul>
                  )}

                </div>

              ))}

            </div>

          )}

          <div className="text-center mt-12">

            <Button
              to="/research"
              variant="chalk"
            >
              Explore research →
            </Button>

          </div>

        </div>

      </section>


      {/* =========================================================
          PROGRAMS
          SAME CARD STYLE AS UPCOMING EVENTS
      ========================================================= */}
      <section className="bg-paper">

        <div className="max-w-6xl mx-auto px-6 py-24">

          {/* SECTION HEADER */}
          <h2 className="font-display text-3xl font-semibold text-center mb-4">
            Programs &amp; Initiatives
          </h2>

          <p className="text-center text-ink-soft max-w-xl mx-auto mb-14">
            Faculty development, hands-on workshops and research training
            that grow AMRI's community of mathematicians.
          </p>


          {/* LOADING */}
          {loading && (
            <p className="text-center text-ink-soft">
              Loading programs...
            </p>
          )}


          {/* EMPTY */}
          {!loading && programs.length === 0 && (
            <p className="text-center text-ink-soft">
              No published programs available.
            </p>
          )}


          {/* PROGRAM CARDS */}
          {!loading && programs.length > 0 && (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {programs.map((program) => (

                <div
                  key={
                    program._id ||
                    program.id ||
                    program.title
                  }
                  className="border border-ink/15 p-6 flex flex-col"
                >

                  {/* CATEGORY */}
                  <p className="eyebrow text-gold">
                    {program.category ||
                      program.tag ||
                      'Program'}
                  </p>


                  {/* TITLE */}
                  <h3 className="font-display text-lg font-semibold mt-3">
                    {program.title ||
                      program.subtitle ||
                      program.shortTitle}
                  </h3>


                  {/* DESCRIPTION */}
                  <p className="text-sm text-ink-soft mt-2 flex-1">
                    {program.shortDescription ||
                      program.description ||
                      program.summary ||
                      program.text ||
                      ''}
                  </p>


                  {/* DATE */}
                  {(program.date ||
                    program.startDate) && (

                    <div className="mt-4 text-xs text-ink-soft">

                      <span className="font-semibold text-ink">
                        Date:
                      </span>{' '}

                      {program.date
                        ? program.date
                        : new Date(
                            program.startDate
                          ).toLocaleDateString('en-GB')}

                    </div>

                  )}


                  {/* LOCATION */}
                  {program.location && (

                    <div className="mt-1 text-xs text-ink-soft">

                      <span className="font-semibold text-ink">
                        Location:
                      </span>{' '}

                      {program.location}

                    </div>

                  )}


                  {/* LEARN MORE */}
                  <Link
                    to="/programs"
                    className="btn-ink inline-flex items-center justify-center mt-5 px-5 py-2.5 text-xs"
                  >
                    Learn more →
                  </Link>
                </div>

              ))}

            </div>

          )}


          {/* CTA */}
          <div className="text-center mt-12">

            <Button
              to="/programs"
              variant="ink"
            >
              See all programs →
            </Button>

          </div>

        </div>

      </section>


      {/* =========================================================
          UPCOMING EVENTS
      ========================================================= */}
      <section className="bg-paper border-y border-ink/10">

        <div className="max-w-6xl mx-auto px-6 py-24">

          <h2 className="font-display text-3xl font-semibold text-center mb-14">
            Upcoming Events
          </h2>


          {/* LOADING */}
          {loading && (
            <p className="text-center text-ink-soft">
              Loading events...
            </p>
          )}


          {/* EMPTY */}
          {!loading && events.length === 0 && (
            <p className="text-center text-ink-soft">
              No upcoming events available.
            </p>
          )}


          {/* EVENT CARDS */}
          {!loading && events.length > 0 && (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {events.map((event) => (

                <div
                  key={
                    event._id ||
                    event.id ||
                    event.title
                  }
                  className="border border-ink/15 p-6 flex flex-col"
                >

                  {/* TAG */}
                  <p className="eyebrow text-gold">
                    {event.tag ||
                      event.category ||
                      'Event'}
                  </p>


                  {/* TITLE */}
                  <h3 className="font-display text-lg font-semibold mt-3">
                    {event.title}
                  </h3>


                  {/* DESCRIPTION */}
                  <p className="text-sm text-ink-soft mt-2 flex-1">
                    {event.shortDescription ||
                      event.description ||
                      event.detail ||
                      event.summary ||
                      ''}
                  </p>


                  {/* DATE */}
                  {(event.eventDate ||
                    event.date ||
                    event.startDate) && (

                    <div className="mt-4 text-xs text-ink-soft">

                      <span className="font-semibold text-ink">
                        Date:
                      </span>{' '}

                      {event.eventDate
                        ? new Date(
                            event.eventDate
                          ).toLocaleDateString('en-GB')
                        : event.date ||
                          new Date(
                            event.startDate
                          ).toLocaleDateString('en-GB')}

                    </div>

                  )}


                  {/* LOCATION */}
                  {event.location && (

                    <div className="mt-1 text-xs text-ink-soft">

                      <span className="font-semibold text-ink">
                        Location:
                      </span>{' '}

                      {event.location}

                    </div>

                  )}


                  {/* REGISTER BUTTON */}
                  <Link
                    to={`/register?type=event&id=${
                      event._id ||
                      event.id
                    }`}
                    className="btn-ink inline-flex items-center justify-center mt-5 px-5 py-2.5 text-xs"
                  >
                    Register now
                  </Link>

                </div>

              ))}

            </div>

          )}


          {/* CTA */}
          <div className="text-center mt-12">

            <Button
              to="/events"
              variant="ink"
            >
              View all events →
            </Button>

          </div>

        </div>

      </section>


      {/* =========================================================
          RESEARCH & INNOVATION IMPACT
      ========================================================= */}
      <section className="chalk-board text-chalk">

        <div className="max-w-4xl mx-auto px-6 py-24 text-center">

          <p className="eyebrow text-gold mb-4">
            Research &amp; Innovation
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            From mathematical ideas to real-world impact
          </h2>


          <div className="mt-10 flex flex-wrap justify-center gap-4 font-mono text-xs uppercase tracking-wider text-chalk/80">

            {innovationDomains.length > 0
              ? innovationDomains.map((domain) => (

                  <span
                    key={domain}
                    className="border border-chalk/25 px-4 py-2"
                  >
                    {domain}
                  </span>

                ))
              : [
                  'Healthcare',
                  'AI & ML',
                  'Agriculture',
                  'Networks',
                ].map((domain) => (

                  <span
                    key={domain}
                    className="border border-chalk/25 px-4 py-2"
                  >
                    {domain}
                  </span>

                ))}

          </div>


          <p className="mt-8 font-display italic text-gold text-lg">
            Mathematical Innovation
          </p>


          <div className="mt-8">

            <Button
              to="/innovation"
              variant="gold"
            >
              Discover our innovation →
            </Button>

          </div>

        </div>

      </section>


      {/* =========================================================
          COMMUNITY
      ========================================================= */}
      <section className="bg-paper">

        <div className="max-w-4xl mx-auto px-6 py-24 text-center">

          <h2 className="font-display text-3xl font-semibold">
            AMRI Community
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3 font-mono text-xs uppercase tracking-wider text-ink-soft">

            <span>Students</span>
            <span>Research Scholars</span>
            <span>Faculty</span>
            <span>Professionals</span>

          </div>

          <p className="mt-8 text-ink-soft tracking-wide">
            Connect &bull; Collaborate &bull; Create
          </p>

        </div>

      </section>


      {/* =========================================================
          BECOME A MEMBER
      ========================================================= */}
      <section className="bg-paper border-y border-ink/10">

        <div className="max-w-3xl mx-auto px-6 py-24 text-center">

          <h2 className="font-display text-3xl font-semibold">
            Become a Member
          </h2>

          <p className="mt-4 text-ink-soft leading-relaxed">
            Be part of a growing mathematical research community.
          </p>

          <div className="mt-8">

            <Button
              to="/membership"
              variant="gold"
            >
              Join AMRI today →
            </Button>

          </div>

        </div>

      </section>


      {/* =========================================================
          NEWS & UPDATES
      ========================================================= */}
      <section className="bg-paper">

        <div className="max-w-4xl mx-auto px-6 py-24">

          <h2 className="font-display text-3xl font-semibold text-center mb-12">
            News &amp; Updates
          </h2>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">

            {[
              'New Research Opportunities',
              'Upcoming FDP',
              'AMRI Membership Open',
              'Workshops & Seminars',
              'Awards & Achievements',
              'Research Collaborations',
            ].map((news) => (

              <div
                key={news}
                className="flex items-center gap-3 border-b border-ink/10 pb-4"
              >

                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />

                <span className="text-sm text-ink-soft">
                  {news}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>

    </>
  )
}