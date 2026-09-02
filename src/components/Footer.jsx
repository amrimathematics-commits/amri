import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="chalk-board text-chalk">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="AMRI logo" className="w-11 h-11 object-contain bg-white rounded-full p-0.5" />
              <span className="font-display font-semibold text-lg">AMRI</span>
            </div>
            <p className="text-chalk/70 text-sm leading-relaxed max-w-xs">
              Association for Mathematics, Research and Innovation — advancing
              mathematics, inspiring research, creating innovation.
            </p>
          </div>

          <div>
            <p className="eyebrow text-gold mb-4">Sitemap</p>
            <ul className="space-y-2 text-sm text-chalk/85">
              <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
              <li><Link to="/research" className="hover:text-gold transition-colors">Research</Link></li>
              <li><Link to="/events" className="hover:text-gold transition-colors">Events</Link></li>
              <li><Link to="/membership" className="hover:text-gold transition-colors">Membership</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold mb-4">Connect</p>
            <ul className="space-y-2 text-sm text-chalk/85">
              <li>
                <Link
                  to="/contact"
                  className="hover:text-gold transition-colors"
                >
                  Email - amrimathematics@gmail.com
                </Link>
              </li>
              {/* <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">YouTube</a>
              </li> */}
              <li>
                <Link
                  to="/contact"
                  className="hover:text-gold transition-colors"
                >
                  Location - 8, SMP nagar, Coimbatore, Tamil Nadu, 642109
                </Link>
                </li>
                <li>
                <Link
                  to="/contact"
                  className="hover:text-gold transition-colors"
                >
                  Phone - +91 8760594879
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-chalk/15 flex flex-col sm:flex-row justify-between gap-2 text-xs text-chalk/55 font-mono">
          <span>&copy; 2026 AMRI. All rights reserved.</span>
          <span>Association for Mathematics, Research and Innovation</span>
        </div>
      </div>
    </footer>
  )
}