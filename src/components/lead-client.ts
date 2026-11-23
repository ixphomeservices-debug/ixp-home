import { emptyLead } from '../../shared/lead.mjs'
import { attribution, track } from './tracking'

export type Lead = Omit<typeof emptyLead, 'additional'> & { additional: string[] }
export type LeadSource = 'estimate' | 'contact' | 'chat'
export type Errors = Record<string, string>
export const newLead = (): Lead => ({ ...emptyLead, additional: [] })
export const newRequest = () => ({ id: crypto.randomUUID(), submittedAt: new Date().toISOString() })

export async function submitLead(lead: Lead, source: LeadSource, request: ReturnType<typeof newRequest>) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': request.id },
    body: JSON.stringify({ ...lead, source, submittedAt: request.submittedAt, ...attribution() }),
    signal: AbortSignal.timeout(15_000)
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok !== true) {
    return { ok: false as const, message: String(result.message ?? 'We couldn’t send your request. Please try again.'), errors: (result.errors ?? {}) as Errors }
  }
  track('lead_success', source)
  return { ok: true as const }
}
