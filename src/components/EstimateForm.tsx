import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { propertyTypes, services, timeframes, validateLead } from '../../shared/lead.mjs'
import { newLead, newRequest, submitLead, type Errors, type Lead, type LeadSource } from './lead-client'
import { track } from './tracking'

const titles = ['Service', 'Property', 'Project', 'Contact', 'Review']
const fields: (keyof Lead)[][] = [
  ['service'], ['propertyAddress', 'zip', 'propertyType', 'squareFeet'],
  ['details', 'timeframe', 'additional'], ['firstName', 'lastName', 'email', 'phone', 'contactMethod', 'consent'], []
]
const serviceOptions = Object.entries(services)
type ServiceKey = keyof typeof services

export function EstimateForm({ source }: { source: Exclude<LeadSource, 'chat'> }) {
  const [params] = useSearchParams()
  const preselected = params.get('service') ?? ''
  const { state } = useLocation()
  const quoteDetails = typeof state?.details === 'string' ? state.details.slice(0, 2000) : ''
  const [lead, setLead] = useState<Lead>(newLead)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const started = useRef(false)
  const request = useRef<ReturnType<typeof newRequest> | null>(null)
  useEffect(() => {
    if (Object.hasOwn(services, preselected)) setLead((current) => ({ ...current, service: preselected, details: current.details || quoteDetails }))
  }, [preselected, quoteDetails])

  function start() {
    if (started.current) return
    started.current = true
    track('form_start', source)
  }

  function change<K extends keyof Lead>(field: K, value: Lead[K]) {
    start()
    request.current = null
    setLead((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: '' }))
    setError('')
  }

  function move(next: number) {
    setStep(next)
    requestAnimationFrame(() => heading.current?.focus())
  }

  function showErrors(validation: Errors) {
    setErrors(validation)
    const first = fields.findIndex((group) => group.some((key) => validation[key]))
    if (first >= 0) move(first)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    start()
    const { errors: validation } = validateLead({ ...lead, source })
    const visibleErrors = step === 4 ? validation : Object.fromEntries(fields[step].filter((key) => validation[key]).map((key) => [key, validation[key]]))
    if (Object.keys(visibleErrors).length) {
      showErrors(visibleErrors)
      return
    }
    if (step < 4) {
      setErrors({})
      move(step + 1)
      return
    }
    setPending(true)
    setError('')
    try {
      request.current ??= newRequest()
      const result = await submitLead(lead, source, request.current)
      if (result.ok) {
        setSuccess(true)
        setLead(newLead())
        requestAnimationFrame(() => heading.current?.focus())
      } else {
        showErrors(result.errors)
        setError(result.message)
      }
    } catch {
      setError('We couldn’t reach the server. Your entries are still here. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function field(key: keyof Lead, label: string, control: ReactNode) {
    return <div className="field"><label htmlFor={key}>{label}</label>{control}
      {errors[key] && <span id={key + '-error'} className="field-error">{errors[key]}</span>}</div>
  }

  function text(key: keyof Lead, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) {
    return field(key, label, <input id={key} value={String(lead[key])} onChange={(event) => change(key, event.target.value)}
      aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? key + '-error' : undefined} {...props} />)
  }

  function select(key: keyof Lead, label: string, options: [string, string][]) {
    return field(key, label, <select id={key} value={String(lead[key])} onChange={(event) => change(key, event.target.value)}
      aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? key + '-error' : undefined}>
      <option value="">Select an option</option>{options.map(([id, option]) => <option key={id} value={id}>{option}</option>)}
    </select>)
  }

  if (success) return <div className="form-card confirmation">
    <CheckCircle2 size={42} aria-hidden="true" /><h2 ref={heading} tabIndex={-1}>Your request was received.</h2>
    <p>Thank you for reaching out to IXP Homes. We’ll follow up using your preferred contact method.</p>
    <Link className="button secondary" to="/">Return Home</Link>
  </div>

  return <form className="form-card" noValidate onSubmit={handleSubmit} onFocus={start} aria-label={source === 'contact' ? 'Contact form' : 'Estimate form'}>
    <ol className="progress-list" aria-label="Form progress">{titles.map((title, index) =>
      <li key={title} aria-current={step === index ? 'step' : undefined} data-complete={index < step}><span>{index + 1}</span>{title}</li>)}</ol>
    <div className="form-content" key={step}>
      <h2 ref={heading} tabIndex={-1}>{['What can we help with?', 'Tell us about the property.', 'What would you like done?', 'How can we reach you?', 'Review your request.'][step]}</h2>
      {step === 0 && select('service', 'Service', serviceOptions)}
      {step === 1 && <>
        {text('propertyAddress', 'Property address', { autoComplete: 'street-address', maxLength: 180 })}
        <div className="field-grid">{text('zip', 'ZIP code', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 5 })}
          {select('propertyType', 'Property type', propertyTypes.map((value) => [value, value]))}</div>
        {text('squareFeet', 'Approximate square footage (optional)', { inputMode: 'numeric', maxLength: 7 })}
      </>}
      {step === 2 && <>
        {field('details', 'Project description', <textarea id="details" rows={4} maxLength={2000} value={lead.details} onChange={(event) => change('details', event.target.value)}
          aria-invalid={Boolean(errors.details)} aria-describedby={errors.details ? 'details-error' : undefined} />)}
        {select('timeframe', 'Preferred timeframe', timeframes.map((value) => [value, value]))}
        <fieldset><legend>Additional services (optional)</legend><div className="checkbox-grid">
          {serviceOptions.filter(([key]) => key !== lead.service && key !== 'other').map(([key, label]) =>
            <label key={key} className="check-field"><input type="checkbox" checked={lead.additional.includes(key)}
              onChange={(event) => change('additional', event.target.checked ? [...lead.additional, key] : lead.additional.filter((value) => value !== key))} />{label}</label>)}</div>
          {errors.additional && <span className="field-error">{errors.additional}</span>}
        </fieldset>
      </>}
      {step === 3 && <>
        <div className="field-grid">{text('firstName', 'First name', { autoComplete: 'given-name', maxLength: 70 })}
          {text('lastName', 'Last name', { autoComplete: 'family-name', maxLength: 70 })}</div>
        {text('email', 'Email', { type: 'email', autoComplete: 'email', maxLength: 254 })}
        {text('phone', source === 'estimate' || lead.contactMethod === 'phone' ? 'Phone' : 'Phone (optional)', { type: 'tel', autoComplete: 'tel', maxLength: 30 })}
        {select('contactMethod', 'Preferred contact method', [['email', 'Email'], ['phone', 'Phone']])}
        <label className="check-field"><input type="checkbox" checked={lead.consent} aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
          onChange={(event) => change('consent', event.target.checked)} /> I agree that IXP Homes may contact me about this request.</label>
        {errors.consent && <span className="field-error" id="consent-error">{errors.consent}</span>}
        <Link className="text-link" to="/privacy" target="_blank" rel="noreferrer">Privacy Policy (opens in a new tab)</Link>
      </>}
      {step === 4 && <dl className="review">
        {[
          ['Service', services[lead.service as ServiceKey]], ['Property', [lead.propertyAddress, lead.zip, lead.propertyType, lead.squareFeet && lead.squareFeet + ' sq ft'].filter(Boolean).join(' · ')],
          ['Project description', lead.details], ['Timeframe', lead.timeframe], ['Additional services', lead.additional.map((key) => services[key as ServiceKey]).join(', ')],
          ['Contact', [lead.firstName + ' ' + lead.lastName, lead.email, lead.phone].filter(Boolean).join(' · ')], ['Preferred contact', lead.contactMethod]
        ].filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
      </dl>}
    </div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={lead.website} onChange={(event) => change('website', event.target.value)} /></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions">
      {step > 0 && <button className="button secondary" type="button" disabled={pending} onClick={() => move(step - 1)}>Back</button>}
      <button className="button primary" disabled={pending} type="submit">{pending ? 'Sending…' : step === 4 ? 'Submit Request' : 'Continue'}</button>
    </div>
  </form>
}
