export type EventName = 'estimate_cta_click' | 'form_start' | 'lead_success' | 'chat_open'

export function track(event: EventName, source?: 'estimate' | 'contact' | 'chat') {
  const detail = { event, ...(source ? { source } : {}) }
  window.dispatchEvent(new CustomEvent('ixp:analytics', { detail }))
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer
  dataLayer?.push(detail)
}

export function attribution() {
  try {
    const key = 'ixp-referral'
    const previous = sessionStorage.getItem(key)
    if (previous) return JSON.parse(previous)
    const params = new URLSearchParams(location.search)
    const clean = (value: string | null) => value?.replace(/[^a-z0-9_. -]/gi, '').slice(0, 80) ?? ''
    const current = {
      utmSource: clean(params.get('utm_source')), utmMedium: clean(params.get('utm_medium')),
      utmCampaign: clean(params.get('utm_campaign')),
      referrer: document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : ''
    }
    sessionStorage.setItem(key, JSON.stringify(current))
    return current
  } catch {
    return {}
  }
}
