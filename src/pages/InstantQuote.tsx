import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Calculator } from 'lucide-react'
import { serviceContent, serviceGroups, type ServiceSlug } from '../config/content'
import { quoteAmount, quotePlans, type QuotePlan } from '../config/pricing'
import { EstimateLink } from '../components/links'
import { PageIntro } from './Marketing'

function QuoteCalculator({ service, plan }: { service: ServiceSlug; plan?: QuotePlan }) {
  const [option, setOption] = useState('0')
  const [quantity, setQuantity] = useState('')
  const [result, setResult] = useState<{ price: string; scope: string }>()
  const rate = plan?.options[Number(option)]
  const units = rate?.low !== undefined ? plan?.quantity : undefined
  const requiresReview = rate?.low === undefined

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!plan || !rate || requiresReview) return
    const count = units ? Number(quantity) : 1
    if (!Number.isInteger(count) || count < 1 || (units && count > units.max)) return
    setResult({ price: quoteAmount(plan, rate, count), scope: rate.label + (units ? ' · ' + units.label + ': ' + count : '') })
  }

  if (!plan) return <div className="quote-controls">
    <p>We’ll ask about your property and the scope of work before preparing a quote.</p>
    <EstimateLink service={service}>Request a Custom Quote</EstimateLink>
  </div>

  return <div className="quote-controls">
    <form onSubmit={calculate}>
      <div className="field"><label htmlFor="quote-scope">Project scope</label>
        <select id="quote-scope" value={option} onChange={(event) => { setOption(event.target.value); setResult(undefined) }}>
          {plan.options.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
        </select>
      </div>
      {units && <div className="field"><label htmlFor="quote-quantity">{units.label}</label>
        <input id="quote-quantity" type="number" inputMode="numeric" min={1} max={units.max} step={1}
          placeholder={'e.g. ' + units.example} required value={quantity}
          onChange={(event) => { setQuantity(event.target.value); setResult(undefined) }} />
      </div>}
      {!requiresReview && <button className="button primary" type="submit">Show My Estimate</button>}
    </form>
    {requiresReview && <>
      <p>We’ll review the project details to give you a written quote.</p>
      <EstimateLink service={service} details={rate?.label}>Request a Custom Quote</EstimateLink>
    </>}
    <div role="status" aria-live="polite">
      {result && <div className="quote-result">
        <div className="quote-result-label">{plan.source ? 'Jacksonville-area planning estimate' : 'IXP Homes starting price'}</div>
        <strong>{result.price}</strong>
        <p>{result.scope}</p>
      </div>}
    </div>
    <p className="quote-note">{plan.note}</p>
    {result && <EstimateLink service={service} details={'Project scope: ' + result.scope} className="button secondary">Request a Written Quote</EstimateLink>}
    {plan.source && <p className="quote-note">Local pricing reference: <a className="text-link" href={plan.source.url} target="_blank" rel="noreferrer">{plan.source.name}</a>.</p>}
  </div>
}

export function InstantQuote() {
  const [params] = useSearchParams()
  const requestedService = params.get('service')
  const [service, setService] = useState<ServiceSlug>('dryer-vent-cleaning')

  useEffect(() => {
    const match = serviceContent.find((item) => item.slug === requestedService)
    if (match) setService(match.slug)
  }, [requestedService])

  return <>
    <PageIntro label="Home service pricing" title="Get an Instant Quote" description="Choose a service and enter a few project details to see an immediate planning estimate." />
    <section className="section quote-section"><div className="wrap quote-grid">
      <div className="quote-intro">
        <Calculator aria-hidden="true" size={27} />
        <h2>How we price projects</h2>
        <p>Use published Jacksonville-area prices to get a sense of the cost. Dryer vent cleaning starts at $177 for one accessible vent.</p>
        <p>We’ll confirm the scope, access, and materials before issuing a written quote.</p>
      </div>
      <div className="form-card">
        <div className="field">
          <label htmlFor="quote-service">Choose a service</label>
          <select id="quote-service" value={service} onChange={(event) => setService(event.target.value as ServiceSlug)}>
            {serviceGroups.map((group) => <optgroup key={group} label={group}>
              {serviceContent.filter((item) => item.group === group).map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
            </optgroup>)}
          </select>
        </div>
        <QuoteCalculator key={service} service={service} plan={quotePlans[service]} />
      </div>
    </div></section>
  </>
}
