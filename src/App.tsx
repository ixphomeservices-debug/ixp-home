import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { Menu, X, Phone } from 'lucide-react'
import { business } from './config/business'
import { pageData, serviceContent } from './config/content'
import { EstimateLink, InstantQuoteLink } from './components/links'
import { InstantQuote } from './pages/InstantQuote'
import { Chat } from './components/Chat'
import { BbbSeal } from './components/BbbSeal'
import { EstimatePopup } from './components/EstimatePopup'
import { attribution } from './components/tracking'
import { About } from './pages/About'
import { Home, Services, ServiceDetails, ServiceAreas, Contact, Estimate, Legal, NotFound } from './pages/Marketing'

const nav = [['Home', '/'], ['Services', '/services'], ['About', '/about'], ['Service Areas', '/service-areas'], ['Contact', '/contact']]
export const missingPage = { title: 'Page Not Found', description: 'Explore the IXP Homes website or return to the homepage.' }

function Wordmark({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  return <Link to="/" className="wordmark" onClick={onClick} aria-label="IXP Homes home">
    <img className="wordmark-lockup" src={light ? '/branding/logo-light.svg' : '/branding/logo-dark.svg'} alt="" width={286} height={62} />
    <span className="wordmark-icon" aria-hidden="true">
      <img className="wordmark-icon-art" src="/branding/logo-compact.svg" alt="" width={60} height={60} />
      <span className="wordmark-icon-name">IXP<span>Homes</span></span>
    </span>
  </Link>
}

function Header() {
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setMenu(false), [pathname])
  return <header className="header" onKeyDown={(event) => { if (event.key === 'Escape') setMenu(false) }}>
    <div className="header-contact"><div className="wrap header-contact-inner">
      <span>Jacksonville &amp; Northeast Florida</span>
      {business.phone && <a href={'tel:' + business.phone}><Phone size={15} aria-hidden="true" /> <strong>Call Us Now</strong> <span>{business.phoneLabel || business.phone}</span></a>}
    </div></div>
    <div className="wrap nav-shell">
      <Wordmark onClick={() => setMenu(false)} />
      <button type="button" className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="primary-nav" aria-label={menu ? 'Close menu' : 'Open menu'}>
        {menu ? <X size={26} /> : <Menu size={26} />}
      </button>
      <nav className={'primary-nav' + (menu ? ' open' : '')} id="primary-nav" aria-label="Main navigation">
        {nav.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenu(false)}>{label}</NavLink>)}
      </nav>
      <InstantQuoteLink className="button primary header-cta">Instant Quote</InstantQuoteLink>
    </div>
  </header>
}

function Footer() {
  return <footer className="footer dark"><div className="wrap">
    <div className="footer-grid">
      <div><Wordmark light />
        <p>Repairs, installations, landscaping projects, inspections, and property care in Jacksonville and Northeast Florida.</p>
        {business.phone && <a href={'tel:' + business.phone} className="footer-phone"><Phone size={16} aria-hidden="true" />{business.phoneLabel || business.phone}</a>}
        <BbbSeal />
      </div>
      <div><h2>Services</h2>{serviceContent.slice(0, 5).map(({ slug, title }) => <Link key={slug} to={'/services/' + slug}>{title}</Link>)}<Link to="/services">View All Services</Link></div>
      <div><h2>IXP Homes</h2><Link to="/about">About</Link><Link to="/service-areas">Service Areas</Link><Link to="/contact">Contact</Link><InstantQuoteLink className="text-link" /><EstimateLink className="text-link" /></div>
    </div>
    <div className="footer-bottom"><span>© IXP Homes</span><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Use</Link></div>
  </div></footer>
}

function RouteEffects() {
  const { pathname, hash } = useLocation()
  const previous = useRef(pathname)
  useEffect(() => { attribution() }, [])
  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'
    const meta = pageData[path] ?? missingPage
    document.title = meta.title + ' | IXP Homes'
    for (const [selector, value] of [
      ['meta[name="description"]', meta.description], ['meta[property="og:title"]', document.title],
      ['meta[property="og:description"]', meta.description], ['meta[property="og:url"]', business.url + path],
      ['meta[name="robots"]', pageData[path] ? 'index, follow' : 'noindex, follow']
    ]) document.querySelector(selector)?.setAttribute('content', value)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (pageData[path]) {
      const link = canonical ?? document.head.appendChild(document.createElement('link'))
      link.rel = 'canonical'
      link.setAttribute('href', business.url + path)
    } else canonical?.remove()
    if (previous.current === pathname) return
    previous.current = pathname
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash])
  return null
}

export function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const { pathname } = useLocation()
  return <>
    <RouteEffects />
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        {serviceContent.map(({ slug }) => <Route key={slug} path={'/services/' + slug} element={<ServiceDetails slug={slug} />} />)}
        <Route path="/about" element={<About />} />
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/instant-quote" element={<InstantQuote />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Chat open={chatOpen} setOpen={setChatOpen} />
    <Footer />
    {!['/estimate', '/instant-quote', '/contact'].includes(pathname.replace(/\/+$/, '')) && <div className="mobile-cta"><InstantQuoteLink /></div>}
    <EstimatePopup chatOpen={chatOpen} />
  </>
}
