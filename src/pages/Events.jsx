import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import { Link } from 'react-router-dom'
import { eventService } from '../services/contentService'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await eventService.getPublished({
          limit: 100,
        })

        setEvents(res.data || [])
      } catch (err) {
        console.error('Failed to load events:', err)
        setError('Unable to load events.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  return (
    <>
      {/* HERO */}
      <PageHero
        eyebrow="Events"
        title="Upcoming events at AMRI"
        description="Workshops, faculty programmes and conferences for the AMRI community."
        symbol="∇"
      />

      {/* EVENTS */}
      <section className="bg-paper">
        <div className="max-w-5xl mx-auto px-6 py-20 space-y-8">

          {/* LOADING */}
          {loading && (
            <p className="text-center text-ink-soft">
              Loading events...
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
            events.length === 0 && (
              <p className="text-center text-ink-soft">
                No upcoming events at the moment.
              </p>
            )}

          {/* EVENT CARDS */}
          {!loading &&
            !error &&
            events.length > 0 && (
              <div className="space-y-8">

                {events.map((ev) => {
                  const eventId = ev._id || ev.id

                  return (
                    <article
                      key={eventId || ev.title}
                      className="border border-ink/15 bg-white overflow-hidden hover:border-pen transition-colors"
                    >

                      {/* IMAGE */}
                      {ev.image && (
                        <div className="w-full overflow-hidden">
                          <img
                            src={ev.image}
                            alt={
                              ev.title ||
                              'AMRI event'
                            }
                            className="w-full h-64 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              console.error(
                                'Event image failed to load:',
                                ev.image
                              )

                              e.currentTarget.parentElement.style.display =
                                'none'
                            }}
                          />
                        </div>
                      )}

                      <div className="p-8">

                        {/* MAIN CONTENT */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-7">

                          <div className="flex-1">

                            {/* CATEGORY */}
                            {(ev.tag ||
                              ev.category) && (
                              <p className="font-mono text-xs uppercase tracking-wider text-pen">
                                {ev.tag ||
                                  ev.category}
                              </p>
                            )}

                            {/* TITLE */}
                            {ev.title && (
                              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                                {ev.title}
                              </h3>
                            )}

                            {/* SHORT DESCRIPTION */}
                            {(ev.shortDescription ||
                              ev.summary ||
                              ev.detail) && (
                              <p className="mt-4 text-sm text-ink-soft leading-relaxed max-w-2xl">
                                {ev.shortDescription ||
                                  ev.summary ||
                                  ev.detail}
                              </p>
                            )}

                            {/* DATE */}
                            {ev.eventDate && (
                              <div className="mt-5 text-sm text-ink-soft">
                                <span className="font-semibold text-ink">
                                  Date:
                                </span>{' '}
                                {new Date(
                                  ev.eventDate
                                ).toLocaleDateString(
                                  'en-GB'
                                )}
                              </div>
                            )}

                            {/* TIME */}
                            {(ev.startTime ||
                              ev.endTime) && (
                              <div className="mt-2 text-sm text-ink-soft">
                                <span className="font-semibold text-ink">
                                  Time:
                                </span>{' '}
                                {ev.startTime || ''}

                                {ev.startTime &&
                                ev.endTime
                                  ? ' – '
                                  : ''}

                                {ev.endTime || ''}
                              </div>
                            )}

                            {/* LOCATION */}
                            {ev.location && (
                              <div className="mt-2 text-sm text-ink-soft">
                                <span className="font-semibold text-ink">
                                  Location:
                                </span>{' '}
                                {ev.location}
                              </div>
                            )}

                            {/* DEPARTMENT */}
                            {ev.department && (
                              <div className="mt-2 text-sm text-ink-soft">
                                <span className="font-semibold text-ink">
                                  Department:
                                </span>{' '}
                                {ev.department}
                              </div>
                            )}

                          </div>

                          {/* REGISTER BUTTON */}
                          {eventId && (
                            <Link
                              to={`/register?type=event&id=${eventId}`}
                              className="btn-ink inline-flex items-center justify-center px-6 py-3 text-xs whitespace-nowrap shrink-0"
                            >
                              Register now →
                            </Link>
                          )}

                        </div>

                        {/* FULL DESCRIPTION */}
                        {ev.fullDescription && (
                          <div className="mt-7 pt-6 border-t border-ink/10">

                            <h4 className="font-display text-lg font-semibold text-ink">
                              About this event
                            </h4>

                            <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                              {ev.fullDescription}
                            </p>

                          </div>
                        )}

                        {/* DESCRIPTION FALLBACK */}
                        {!ev.fullDescription &&
                          ev.description && (
                            <div className="mt-7 pt-6 border-t border-ink/10">

                              <h4 className="font-display text-lg font-semibold text-ink">
                                About this event
                              </h4>

                              <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                                {ev.description}
                              </p>

                            </div>
                          )}

                        {/* ORGANIZER */}
                        {ev.organizer && (
                          <div className="mt-5 text-sm text-ink-soft">
                            <span className="font-semibold text-ink">
                              Organizer:
                            </span>{' '}
                            {ev.organizer}
                          </div>
                        )}

                        {/* SPEAKERS */}
                        {ev.speakers && (
                          <div className="mt-3 text-sm text-ink-soft">

                            <span className="font-semibold text-ink">
                              Speakers:
                            </span>{' '}

                            {Array.isArray(
                              ev.speakers
                            )
                              ? ev.speakers
                                  .map(
                                    (speaker) =>
                                      typeof speaker ===
                                      'string'
                                        ? speaker
                                        : speaker.name ||
                                          speaker.title ||
                                          ''
                                  )
                                  .filter(Boolean)
                                  .join(', ')
                              : ev.speakers}

                          </div>
                        )}

                        {/* EXTERNAL INFORMATION LINK */}
                        {ev.externalUrl && (
                          <div className="mt-5">

                            <a
                              href={ev.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-pen hover:underline"
                            >
                              More Information →
                            </a>

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
    </>
  )
}