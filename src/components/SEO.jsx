import { useEffect } from 'react'

const SITE_URL = 'https://amri-rho.vercel.app'

const DEFAULT_TITLE =
  'AMRI — Association for Mathematics, Research and Innovation'

const DEFAULT_DESCRIPTION =
  'AMRI — Association for Mathematics, Research and Innovation. Advancing mathematics, research, education and innovation through collaboration among students, researchers, faculty and professionals.'

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = '',
  path = '/',
  noIndex = false,
}) {
  useEffect(() => {
    document.title = title

    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`

    // Helper for standard meta tags
    const setMeta = (name, content) => {
      if (!content) return

      let meta = document.querySelector(`meta[name="${name}"]`)

      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }

      meta.setAttribute('content', content)
    }

    // Helper for Open Graph tags
    const setProperty = (property, content) => {
      if (!content) return

      let meta = document.querySelector(`meta[property="${property}"]`)

      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }

      meta.setAttribute('content', content)
    }

    // Standard SEO
    setMeta('description', description)
    setMeta('keywords', keywords)
    setMeta(
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow'
    )

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute('href', canonicalUrl)

    // Open Graph
    setProperty('og:title', title)
    setProperty('og:description', description)
    setProperty('og:type', 'website')
    setProperty('og:url', canonicalUrl)
    setProperty('og:site_name', 'AMRI')

    // Twitter
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title, description, keywords, path, noIndex])

  return null
}