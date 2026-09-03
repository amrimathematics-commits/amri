import PageHero from '../components/PageHero.jsx'
import Button from '../components/Button.jsx'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About AMRI"
        title="Connecting mathematical knowledge with research and innovation"
        description="AMRI is an academic platform dedicated to promoting mathematics, research, innovation and interdisciplinary collaboration."
        symbol="∫"
      />

      <section className="bg-paper">
        <div className="max-w-4xl mx-auto px-6 py-20">

          <p className="text-ink-soft leading-relaxed text-lg">
            AMRI — the Association for Mathematics, Research and Innovation — brings
            together students, researchers, faculty members and professionals around
            a shared belief: that mathematics is the connective tissue of research and
            technological progress. We build the programmes, spaces and networks that
            turn mathematical curiosity into published research and applied innovation.
          </p>

          {/* =====================================================
              VISION, MISSION & CORE VALUES
          ===================================================== */}

          <div className="mt-16 grid md:grid-cols-3 gap-6">

            {/* VISION */}
            <div className="border border-ink/15 p-7 hover:border-pen transition-colors">

              <span className="font-mono text-xs tracking-widest text-gold">
                01
              </span>

              <h3 className="mt-4 font-mono text-xs uppercase tracking-wider">
                Vision
              </h3>

              <h4 className="mt-5 font-display text-xl font-semibold leading-snug">
                Shaping the Future Through Mathematics
              </h4>

              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                To build a globally connected mathematical community that advances
                <strong className="text-ink">
                  {' '}excellence, innovation, and impactful research.
                </strong>
              </p>

            </div>


            {/* MISSION */}
            <div className="border border-ink/15 p-7 hover:border-pen transition-colors">

              <span className="font-mono text-xs tracking-widest text-gold">
                02
              </span>

              <h3 className="mt-4 font-mono text-xs uppercase tracking-wider">
                Mission
              </h3>

              <h4 className="mt-5 font-display text-xl font-semibold leading-snug">
                Turning Knowledge into Impact
              </h4>

              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                To foster
                <strong className="text-ink">
                  {' '}research, collaboration, and interdisciplinary innovation
                </strong>
                {' '}by creating meaningful opportunities for learning, discovery,
                and professional growth.
              </p>

            </div>


            {/* CORE VALUES */}
            <div className="border border-ink/15 p-7 hover:border-pen transition-colors">

              <span className="font-mono text-xs tracking-widest text-gold">
                03
              </span>

              <h3 className="mt-4 font-mono text-xs uppercase tracking-wider">
                Core Values
              </h3>

              <h4 className="mt-5 font-display text-xl font-semibold leading-snug">
                Excellence. Integrity. Innovation.
              </h4>

              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                We champion
                <strong className="text-ink">
                  {' '}collaboration, curiosity, inclusivity, and impact,
                </strong>
                {' '}empowering individuals to explore ideas, create knowledge,
                and shape the future.
              </p>

            </div>

          </div>


          {/* =====================================================
              JOIN AMRI
          ===================================================== */}

          <div className="mt-16 text-center">
            <Button to="/membership" variant="gold">
              Join AMRI
            </Button>
          </div>

        </div>
      </section>
    </>
  )
}