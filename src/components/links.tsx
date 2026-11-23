import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { track } from './tracking'

export function EstimateLink({ children = 'Request an Estimate', service, details, className = 'button primary' }: {
  children?: ReactNode
  service?: string
  details?: string
  className?: string
}) {
  return <Link className={className} to={'/estimate' + (service ? '?service=' + encodeURIComponent(service) : '')}
    state={details ? { details } : undefined}
    onClick={() => track('estimate_cta_click')}>{children}</Link>
}

export function InstantQuoteLink({ service, children = 'Get an Instant Quote', className = 'button primary' }: {
  service?: string
  children?: ReactNode
  className?: string
}) {
  return <Link className={className} to={'/instant-quote' + (service ? '?service=' + encodeURIComponent(service) : '')}>{children}</Link>
}
