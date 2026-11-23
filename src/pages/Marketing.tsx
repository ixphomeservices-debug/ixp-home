import { Link } from 'react-router'
import {
  ClipboardCheck, Hammer, Wrench, MapPin, ChevronDown,
  MessageSquare, ScanSearch, CalendarCheck, ListChecks, Focus, Check, Mail, Phone, BadgeCheck
} from 'lucide-react'
import { business } from '../config/business'
import { serviceContent, serviceGroups } from '../config/content'
import { quotePlans } from '../config/pricing'
import { images, type Photo as PhotoData } from '../config/images'
import { Comparison } from '../components/Comparison'
import { Photo } from '../components/Photo'
import { PhotoGallery } from '../components/PhotoGallery'
import { EstimateLink, InstantQuoteLink } from '../components/links'
import { EstimateForm } from '../components/EstimateForm'
import { BbbSeal } from '../components/BbbSeal'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

const groupIcons = [Wrench, Hammer, ClipboardCheck]
const steps = [
  { icon: MessageSquare, title: 'Tell us about your property', description: 'Share the service you need, the property location, and what you’d like us to know.' },
  { icon: ListChecks, title: 'Receive a personalized estimate', description: 'We’ll follow up about your priorities, confirm the scope, and discuss a quote.' },
  { icon: CalendarCheck, title: 'Schedule your service', description: 'Once the scope works for you, we’ll coordinate timing and property access.' }
]
const principles = [
  { icon: ScanSearch, title: 'Attention to detail', description: 'We start with your property’s condition, materials, and the areas that concern you.' },
  { icon: MessageSquare, title: 'Clear communication', description: 'We discuss what we can evaluate or address and answer questions about next steps.' },
  { icon: Focus, title: 'Modern tools', description: 'We use tools suited to the task, based on the materials and access at your property.' }
]

export function PageIntro({ label, title, description, compact = false, children }: {
  label?: string; title: string; description: string; compact?: boolean; children?: ReactNode
}) {
  return <section className={compact ? 'page-intro page-intro-compact' : 'page-intro'}><div className="wrap">
    {label && <p className="eyebrow">{label}</p>}<h1>{title}</h1><p className="lede">{description}</p>{children}
  </div></section>
}

function SectionTitle({ label, title, description }: { label: string; title: string; description?: string }) {
  return <div className="section-title"><p className="eyebrow">{label}</p><h2>{title}</h2>
    {description && <p className="lede">{description}</p>}</div>
}

function EndCta({ service }: { service?: string }) {
  return <section className="end-cta dark"><div className="wrap">
    <p className="eyebrow">Request a free estimate</p>
    <h2>Your Home Deserves Exceptional Attention.</h2>
    <EstimateLink service={service}>Request Your Estimate</EstimateLink>
  </div></section>
}

function ServiceCard({ service, expandable = false }: { service: (typeof serviceContent)[number]; expandable?: boolean }) {
  const [detailsMode, setDetailsMode] = useState<'hover' | 'open' | null>(null)
  const detailsOpen = detailsMode !== null
  const detailsId = useId()
  const detailsButton = useRef<HTMLButtonElement>(null)
  const price = quotePlans[service.slug]
  const path = '/services/' + service.slug
  const photo = <Photo photo={service.photo} sizes="(max-width: 350px) 100vw, (max-width: 790px) 50vw, (max-width: 1020px) 33vw, 25vw" />
  const pricing = <div className="card-price">
    <span>{price ? price.source ? 'Local planning range' : 'IXP Homes pricing' : 'Project pricing'}</span>
    <strong>{price?.summary ?? 'Custom quote'}</strong>
  </div>
  useEffect(() => {
    if (!detailsOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (document.activeElement?.id === detailsId) detailsButton.current?.focus()
      setDetailsMode(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [detailsId, detailsOpen])

  return <article className={expandable ? 'service-card service-card-expandable' : 'service-card'}
    onPointerEnter={expandable ? (event) => { if (event.pointerType === 'mouse') setDetailsMode((mode) => mode ?? 'hover') } : undefined}
    onPointerLeave={expandable ? (event) => { if (event.pointerType === 'mouse') setDetailsMode((mode) => mode === 'hover' ? null : mode) } : undefined}>
    {expandable ? <div className="card-image">{photo}</div> : <Link to={path} className="card-image" aria-label={service.title}>{photo}</Link>}
    <div className="card-body">
      {expandable
        ? <h2 className="card-title"><Link to={path} aria-label={'Details about ' + service.title}>{service.title}</Link></h2>
        : <h4 className="card-title">{service.title}</h4>}
      {!expandable && <><p>{service.cardDescription}</p>{pricing}</>}
      <div className="card-links">
        {expandable
          ? <button ref={detailsButton} type="button" aria-label={'Quick info for ' + service.title}
              aria-controls={detailsId} aria-expanded={detailsOpen}
              onClick={() => setDetailsMode((mode) => mode === 'open' ? null : 'open')}>Quick Info</button>
          : <Link to={path} aria-label={'Details about ' + service.title}>Details</Link>}
        {price
          ? <InstantQuoteLink className="text-link" service={service.slug}><span className="sr-only">{service.title}: </span>Instant Quote</InstantQuoteLink>
          : <EstimateLink className="text-link" service={service.slug}><span className="sr-only">{service.title}: </span>Get a Quote</EstimateLink>}
      </div>
    </div>
    {expandable && <div className="card-preview" id={detailsId} hidden={!detailsOpen}
      role="region" aria-label={service.title + ' quick info'} tabIndex={0}>
      {pricing}
      <p>{service.description}</p>
    </div>}
  </article>
}

function ServiceCards() {
  return <div className="service-directory">
    {serviceGroups.map((group, index) => {
      const Icon = groupIcons[index]
      return <section className="service-group" key={group}>
        <h3><Icon size={22} aria-hidden="true" />{group}</h3>
        <div className="service-grid">
          {serviceContent.filter((service) => service.group === group).map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
      </section>
    })}
  </div>
}

function PhotoPanel({ photo, label, title, children, reverse = false, dark = false }: {
  photo: PhotoData; label: string; title: string; children: ReactNode; reverse?: boolean; dark?: boolean
}) {
  return <section className={'split section ' + (dark ? 'dark ' : '')}>
    <div className={'wrap split-grid ' + (reverse ? 'reverse' : '')}>
      <figure className="editorial-photo"><Photo photo={photo} />{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>
      <div className="split-copy"><p className="eyebrow">{label}</p><h2>{title}</h2>{children}</div>
    </div>
  </section>
}

function Principles() {
  return <section className="section pale"><div className="wrap">
    <SectionTitle label="Why IXP Homes" title="Care starts with the details." />
    <div className="feature-grid">{principles.map(({ icon: Icon, title, description }) =>
      <article key={title}><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></article>)}</div>
  </div></section>
}

function Areas({ link = true }: { link?: boolean }) {
  return <section className="section"><div className="wrap areas-grid">
    <div><SectionTitle label="Local service" title="Jacksonville & the Northeast Florida coast."
      description="Tell us your property location and the service you need. We’ll confirm availability before scheduling." />
      {link && <Link className="button secondary" to="/service-areas">Explore Service Areas</Link>}</div>
    <ul className="area-list">{business.areas.map((area) => <li key={area}><MapPin size={16} aria-hidden="true" />{area}</li>)}</ul>
  </div></section>
}

function BusinessCredentials() {
  const { homeInspectorLicense, contractorLicense, insured } = business.credentials
  if (!homeInspectorLicense && !contractorLicense && !insured) return null
  return <ul className="business-credentials" aria-label="Business credentials">
    {homeInspectorLicense && <li><BadgeCheck aria-hidden="true" size={16} /> Home inspector license {homeInspectorLicense}</li>}
    {contractorLicense && <li><BadgeCheck aria-hidden="true" size={16} /> Contractor license {contractorLicense}</li>}
    {insured && <li><BadgeCheck aria-hidden="true" size={16} /> Insured</li>}
  </ul>
}

export function Home() {
  return <>
    <section className="hero dark">
      <div className="hero-visual">
        <Photo photo={images.hero} eager className="hero-image" sizes="100vw" />
      </div>
      <div className="wrap hero-grid">
        <div className="hero-content">
          <p className="eyebrow"><span /> Jacksonville &amp; Northeast Florida</p>
          <h1>Home services. <em>Inside and out.</em></h1>
          <p>Jacksonville-area home inspections, repairs, installations, and landscaping projects. Start with a price range online or talk with us about your project.</p>
          <div className="actions"><InstantQuoteLink /><Link className="button light-outline" to="/services">Explore Our Services</Link></div>
          <BusinessCredentials />
        </div>
        <BbbSeal hero />
      </div>
      <a className="hero-scroll" href="#services" aria-label="Scroll to property services"><ChevronDown size={21} aria-hidden="true" /></a>
    </section>
    <section id="services" className="section services-home"><div className="wrap">
      <div className="section-title"><h2>Our Services</h2><p className="lede">Explore what each service covers and what to budget.</p></div>
      <ServiceCards /><p className="photo-note">{images.demoCaption}</p>
    </div></section>
    <PhotoPanel photo={images.maintenance} label="About IXP Homes" title="Property care, tailored to your home." reverse>
      <p>Every home has its own details, materials, and maintenance needs. We help Northeast Florida homeowners understand their property and plan services around its condition and their priorities.</p>
      <div className="actions"><Link className="button secondary" to="/about">About IXP Homes</Link><Link className="text-link" to="/services/luxury-property-care">Luxury Property Care</Link></div>
    </PhotoPanel>
    <Principles />
    <section className="section"><div className="wrap gallery-layout">
      <SectionTitle label="Before & after" title="See the difference on pavers."
        description="Move the slider to compare how a stained walkway and a cleaned one can look." />
      <Comparison />
    </div></section>
    <PhotoPanel photo={{ ...images.dryerVent, caption: "Illustrative dryer vent cleaning photo." }} label="Dryer vent cleaning" title="Clear lint from your dryer vent." dark>
      <p>If clothes take longer to dry or you notice lint at the outside vent, tell us about your setup. We’ll discuss access and what cleaning can cover.</p>
      <Link className="button light-outline" to="/services/dryer-vent-cleaning">Explore Dryer Vent Cleaning</Link>
    </PhotoPanel>
    <section className="section pale"><div className="wrap">
      <SectionTitle label="How it works" title="From first question to scheduled service." />
      <ol className="feature-grid">{steps.map(({ icon: Icon, title, description }) =>
        <li key={title}><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </div></section>
    <Areas /><EndCta />
  </>
}

export function Services() {
  return <>
    <PageIntro compact title="Our Services" description="Home repairs, installations, landscaping projects, and inspections in Jacksonville and Northeast Florida." />
    <section className="section services-list"><div className="wrap">
      <div className="service-grid">
        {serviceGroups.flatMap((group) => serviceContent.filter((service) => service.group === group))
          .map((service) => <ServiceCard key={service.slug} service={service} expandable />)}
      </div>
      <p className="photo-note">{images.demoCaption}</p>
    </div></section>
    <EndCta />
  </>
}

export function ServiceDetails({ slug }: { slug: string }) {
  const service = serviceContent.find((item) => item.slug === slug)
  if (!service) return <NotFound />
  const price = quotePlans[service.slug]
  return <>
    <PageIntro label="IXP Homes services" title={service.title} description={service.description}>
      {price && <p className="service-intro-price"><strong>{price.summary}</strong>{price.source && <span>Local planning range</span>}</p>}
      <div className="actions">
        {price && <InstantQuoteLink service={slug} />}
        <EstimateLink service={slug} className={price ? 'button secondary' : undefined}>Request a Written Quote</EstimateLink>
      </div>
    </PageIntro>
    <PhotoPanel photo={{ ...service.photo, caption: images.demoCaption }} label="Service details" title="What we can help with">
      <p>{service.intro}</p><ul className="check-list">{service.details.map((item) => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul>
      <p>{service.note}</p>
    </PhotoPanel>
    {slug === 'pressure-washing' && <section className="section pale"><div className="wrap gallery-layout">
      <SectionTitle label="Before & after" title="Compare stained and cleaned pavers." /><Comparison />
    </div></section>}
    <EndCta service={slug} />
  </>
}

export function About() {
  return <>
    <PageIntro compact title="About IXP Homes" description="We help Northeast Florida homeowners plan repairs, installations, inspections, and property care." />
    <PhotoPanel photo={{ ...images.hero, caption: images.demoCaption }} label="Our approach" title="We start with your property.">
      <p>We ask what you need to learn or maintain, discuss access and timing, and confirm what the service can cover. You can start with one priority or share a list of services you’re considering.</p>
      <Link className="button secondary" to="/services">Explore Our Services</Link>
    </PhotoPanel>
    <Principles />
    <section className="section"><div className="wrap">
      <SectionTitle label="In the field" title="What property care looks like." description={images.demoCaption} />
      <PhotoGallery photos={[
        { ...images.inspection, caption: "Inspecting visible conditions around a window." },
        { ...images.dryerVent, caption: "Clearing buildup from an exterior dryer vent." },
        { ...images.washing, caption: "Cleaning an exterior paver surface." }
      ]} />
    </div></section>
    <EndCta />
  </>
}

export function ServiceAreas() {
  return <>
    <PageIntro compact title="Service Areas" description="Request service in Jacksonville and nearby coastal and inland communities." />
    <Areas link={false} /><EndCta />
  </>
}

export function Contact() {
  return <>
    <PageIntro compact title="Contact IXP Homes" description="Tell us how we can help with your home or landscaping project." />
    <section className="section"><div className="wrap contact-grid">
      <div><h2>Let’s talk about your property.</h2><p>Send an inquiry below or use the guided chat to tell us what you need.</p>
        {business.phone && <p><a href={'tel:' + business.phone}><Phone size={18} aria-hidden="true" /> {business.phoneLabel || business.phone}</a></p>}
        {business.email && <p><a href={'mailto:' + business.email}><Mail size={18} aria-hidden="true" /> {business.email}</a></p>}
        <EstimateLink className="button secondary" />
      </div>
      <EstimateForm source="contact" />
    </div></section>
  </>
}

export function Estimate() {
  return <>
    <PageIntro label="Tell us what you need" title="Request an Estimate" description="Share a few details and we’ll follow up about scope, availability, and a no-obligation service quote." />
    <section className="section"><div className="wrap estimate-wrap"><EstimateForm source="estimate" /></div></section>
  </>
}

export function Legal({ terms = false }: { terms?: boolean }) {
  return <>
    <PageIntro label="IXP Homes" title={terms ? 'Terms of Use' : 'Privacy Policy'} description={terms ? 'Terms for using the site and requesting services.' : 'How we handle the information you provide on this website.'} />
    <div className="wrap section prose">
      {terms ? <>
        <h2>Online estimates</h2><p>Instant estimates are preliminary planning figures. We confirm the scope, applicable requirements, and price before issuing a written proposal.</p>
        <h2>Requests and scheduling</h2><p>An estimate request begins a conversation about scope, price, and availability. A service agreement is made separately. Quotes and scheduling depend on the property and the service requested.</p>
        <h2>Property information</h2><p>Site content is general information. Service findings, limitations, and responsibilities are described in the applicable service agreement. Imagery marked illustrative depicts example properties or conditions.</p>
        <h2>Questions about these terms</h2><p>Send questions through our <Link to="/contact">contact page</Link>.</p>
      </> : <>
        <h2>Information we receive</h2><p>When you use a form or guided chat, we use your name, contact details, property location, and project details to respond to your request and coordinate service. Referral host and campaign labels may accompany an inquiry.</p>
        <h2>How inquiries are handled</h2><p>We route submitted inquiries through Resend to our configured business inbox. The website does not maintain a lead database. Hosting and delivery providers may process information needed to operate the website and deliver inquiries.</p>
        <h2>Contact preferences and site activity</h2><p>Your consent applies to follow-up about your inquiry. This site uses browser session storage to remember referral information and whether you have seen the estimate prompt. Analytics events are limited to interaction names and the form or chat source.</p>
        <h2>Questions about your information</h2><p>Use our <Link to="/contact">contact page</Link> to ask about or request changes to information you have shared with IXP Homes.</p>
      </>}
    </div>
  </>
}

export function NotFound() {
  return <section className="page-intro dark"><div className="wrap">
    <p className="eyebrow">404</p><h1>Page not found.</h1><p className="lede">Head back to the homepage or find the service you were looking for.</p>
    <div className="actions"><Link className="button primary" to="/">Return Home</Link><Link className="button light-outline" to="/services">Explore Our Services</Link></div>
  </div></section>
}
