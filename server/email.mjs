import { emailValid, services } from '../shared/lead.mjs'

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

export function resendMailer(env = process.env, send = fetch) {
  const { RESEND_API_KEY: key, LEADS_TO_EMAIL: to, LEADS_FROM_EMAIL: from } = env
  if (!key || !emailValid(to ?? '') || !emailValid(from ?? '')) return null
  return async (lead, idempotencyKey) => {
    const rows = [
      ['Name', [lead.firstName, lead.lastName].join(' ')],
      ['Email', lead.email], ['Phone', lead.phone], ['Preferred contact', lead.contactMethod],
      ['Service', services[lead.service]], ['Additional services', lead.additional.map((key) => services[key]).join(', ')],
      ['Property location', [lead.propertyAddress, lead.zip].join(', ')],
      ['Property type', lead.propertyType], ['Approximate square feet', lead.squareFeet],
      ['Timeframe', lead.timeframe], ['Project details', lead.details],
      ['Source', lead.source], ['Referral host', lead.referrer], ['Campaign source', lead.utmSource],
      ['Campaign medium', lead.utmMedium], ['Campaign', lead.utmCampaign],
      ['Contact consent', lead.consentVersion], ['Submitted at (UTC)', lead.submittedAt]
    ].filter(([, value]) => value)
    const response = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      signal: AbortSignal.timeout(9000),
      body: JSON.stringify({
        from, to: [to], subject: 'New inquiry | IXP Homes', reply_to: lead.email,
        text: rows.map(([label, value]) => label + ': ' + value).join('\n'),
        html: '<h1>New IXP Homes inquiry</h1><dl>' + rows.map(([label, value]) =>
          '<dt><strong>' + escapeHtml(label) + '</strong></dt><dd>' + escapeHtml(value).replace(/\r?\n/g, '<br>') + '</dd>').join('') + '</dl>'
      })
    })
    if (!response.ok || !(await response.json()).id) throw new Error('Email delivery rejected')
  }
}
