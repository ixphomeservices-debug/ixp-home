import { CalendarCheck, MessageSquare, ListChecks, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { BbbSeal } from '../components/BbbSeal'
import { EstimateLink } from '../components/links'
import { Photo } from '../components/Photo'
import { PhotoGallery } from '../components/PhotoGallery'
import { business } from '../config/business'
import { images } from '../config/images'
import { PageIntro } from './Marketing'

const process = [
  {
    icon: MessageSquare,
    title: 'Tell us what needs attention',
    description: 'Share the property location, what you want done, and any concerns or timing that matters to you.'
  },
  {
    icon: ListChecks,
    title: 'Review the scope and price',
    description: 'Use online pricing to plan where available. We’ll discuss details like materials and access before preparing a written quote.'
  },
  {
    icon: CalendarCheck,
    title: 'Schedule the work',
    description: 'Once we agree on the scope, we’ll coordinate the visit and go over anything you need to prepare.'
  }
]

export function About() {
  return <>
    <PageIntro compact title="About IXP Homes" description="Local help for home inspections, repairs, and property care in Jacksonville and Northeast Florida." />
    <section className="section" aria-labelledby="about-approach">
      <div className="wrap split-grid reverse about-intro">
        <figure className="editorial-photo">
          <Photo photo={images.inspection} eager />
          <figcaption>Illustrative home inspection photo.</figcaption>
        </figure>
        <div className="about-copy">
          <h2 id="about-approach">Practical help for the work your home needs.</h2>
          <p>Some projects start with a list of small repairs. Others start with a question about a home you’re buying or a change you want to make outdoors. We help you define the work so you can decide what to tackle first.</p>
          <p>Our services range from home inspections and dryer vent cleaning to drywall repair, flooring, and one-time landscaping projects. We’ll ask about your property, your priorities, and any finishes or materials you want to keep.</p>
          <div className="actions">
            <Link className="button secondary" to="/services">Explore Our Services</Link>
            <Link className="text-link" to="/service-areas">See Service Areas</Link>
          </div>
        </div>
      </div>
    </section>
    <section className="section pale" aria-labelledby="about-process">
      <div className="wrap">
        <h2 id="about-process">What to expect</h2>
        <ol className="feature-grid">{process.map(({ icon: Icon, title, description }) =>
          <li key={title}><Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </div>
    </section>
    <section className="section" aria-labelledby="about-services">
      <div className="wrap">
        <h2 id="about-services">A closer look at our services</h2>
        <PhotoGallery photos={[
          { ...images.washing, caption: 'Pressure washing an exterior paver surface.' },
          { ...images.drywall, caption: 'Smoothing a drywall repair before finishing.' },
          { ...images.landscaping, caption: 'Adding plants and edging to a garden bed.' }
        ]} />
        <p className="photo-note">{images.demoCaption}</p>
      </div>
    </section>
    <section className="section dark about-contact" aria-labelledby="about-contact">
      <div className="wrap about-contact-inner">
        <div>
          <h2 id="about-contact">Let’s talk about your home.</h2>
          <p>Tell us what you have in mind and we’ll help you take the next step.</p>
          <div className="actions">
            <EstimateLink>Request an Estimate</EstimateLink>
            {business.phone && <a className="button light-outline about-phone" href={'tel:' + business.phone}>
              <Phone size={17} aria-hidden="true" /> Call {business.phoneLabel || business.phone}
            </a>}
          </div>
        </div>
        <BbbSeal />
      </div>
    </section>
  </>
}
