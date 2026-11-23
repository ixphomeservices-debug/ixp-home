import { createServer } from 'node:http'
import { once } from 'node:events'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/index.mjs'
import { resendMailer } from '../server/email.mjs'
import { validateLead, emptyLead } from '../shared/lead.mjs'
import { answerChat, chatSteps } from '../shared/chat.mjs'

const lead = {
  ...emptyLead, service: 'pressure-washing', propertyAddress: 'Sample Property', zip: '32250',
  propertyType: 'Single-family home', details: 'Clean the patio <carefully>.', timeframe: 'Flexible',
  firstName: 'Jamie', lastName: 'Sample', email: 'jamie@example.com', phone: '904-555-0101',
  source: 'estimate', consent: true
}

test('validates required fields, consent, phone, typed values, and restricted input', () => {
  assert.deepEqual(validateLead(lead).errors, {})
  assert.ok(validateLead({ ...lead, details: 'short' }).errors.details)
  assert.ok(validateLead({ ...lead, consent: false }).errors.consent)
  assert.ok(validateLead({ ...lead, email: 'a@b.com\r\nBcc:c@b.com' }).errors.email)
  assert.ok(validateLead({ ...lead, phone: '' }).errors.phone)
  assert.ok(validateLead({ ...lead, squareFeet: 1000 }).errors.squareFeet)
  assert.ok(validateLead({ ...lead, service: 'constructor' }).errors.service)
  assert.ok(validateLead({ ...lead, service: 'drone-inspections' }).errors.service)
  assert.deepEqual(validateLead({ ...lead, service: 'dryer-vent-cleaning' }).errors, {})
  assert.ok(validateLead({ ...lead, service: 'bathroom-remodeling' }).errors.service)
  assert.ok(validateLead({ ...lead, service: 'home-remodeling' }).errors.service)
  assert.deepEqual(validateLead({ ...lead, service: 'landscaping-projects', additional: ['flooring-installation', 'tile-installation', 'interior-painting', 'trim-carpentry', 'door-installation'] }).errors, {})
  assert.ok(validateLead({ ...lead, website: 'https://example.com' }).errors.website)
  assert.ok(validateLead({ ...lead, additional: ['constructor'] }).errors.additional)
  assert.deepEqual(validateLead({ ...lead, phone: '', source: 'chat' }).errors, {})
  assert.ok(validateLead({ ...lead, phone: '', source: 'chat', contactMethod: 'phone' }).errors.phone)
})

test('chat supports typed and quick replies, optional phone, and consent', () => {
  let draft = { ...emptyLead }
  const replies = ['Pressure Washing', 'Single-family home', 'Jacksonville Beach', '32250', 'Clean the exterior pavers.', 'Flexible', 'Jamie', 'Sample', 'jamie@example.com', 'Skip', 'Email', 'I Agree']
  assert.equal(replies.length, chatSteps.length)
  assert.ok(answerChat(draft, 0, 'roof???').error)
  assert.ok(answerChat(draft, 10, 'Phone').error)
  assert.equal(answerChat(draft, 11, 'No, Thanks').declined, true)
  for (const [index, reply] of replies.entries()) {
    const result = answerChat(draft, index, reply)
    assert.equal(result.error, undefined)
    draft = result.lead
  }
  assert.deepEqual(validateLead({ ...draft, source: 'chat' }).errors, {})
})

async function withServer(app, run) {
  const server = createServer(app)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    await run('http://127.0.0.1:' + server.address().port)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}
const post = (url, value, headers = {}) => fetch(url + '/api/leads', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(value)
})
const testEnv = { RESEND_API_KEY: 'test-key', LEADS_TO_EMAIL: 'leads@example.com', LEADS_FROM_EMAIL: 'sent@example.com' }

test('API delivers a valid lead through Resend, with safely formatted details and retry key', async () => {
  const calls = []
  const mailer = resendMailer(testEnv, async (url, request) => {
    calls.push({ url, request })
    return Response.json({ id: 'example-delivery' })
  })
  await withServer(createApp({ mailer }), async (url) => {
    assert.deepEqual(await (await fetch(url + '/health')).json(), { ok: true })
    assert.equal((await post(url, { ...lead, email: 'bad' })).status, 400)
    const sentLead = { ...lead, submittedAt: new Date().toISOString() }
    const headers = { 'Idempotency-Key': 'd898589f-2fec-48b5-8b5a-b551a05dea11' }
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await post(url, sentLead, headers)
      assert.equal(response.status, 201)
      assert.deepEqual(await response.json(), { ok: true })
    }
    assert.equal(calls.length, 2)
    assert.equal(calls[0].url, 'https://api.resend.com/emails')
    assert.equal(calls[0].request.headers['Idempotency-Key'], calls[1].request.headers['Idempotency-Key'])
    assert.equal(calls[0].request.body, calls[1].request.body)
    const body = JSON.parse(calls[0].request.body)
    assert.equal(body.reply_to, lead.email)
    assert.deepEqual(body.to, ['leads@example.com'])
    assert.match(body.html, /&lt;carefully&gt;/)
  })
})

test('API returns safe failures when email is unavailable or rejected', async () => {
  await withServer(createApp({ mailer: null }), async (url) => {
    assert.equal((await post(url, lead)).status, 503)
    assert.equal((await post(url, lead, { 'Sec-Fetch-Site': 'cross-site' })).status, 400)
    assert.equal((await post(url, { ...lead, details: 'a'.repeat(13000) })).status, 413)
  })
  const mailer = resendMailer(testEnv, async () => Response.json({ message: 'internal@example.com' }, { status: 500 }))
  await withServer(createApp({ mailer }), async (url) => {
    const response = await post(url, lead)
    assert.equal(response.status, 502)
    assert.doesNotMatch(await response.text(), /internal@example.com|test-key/)
  })
})

test('API throttles repeated submissions', async () => {
  await withServer(createApp({ mailer: null }), async (url) => {
    for (let attempt = 0; attempt < 12; attempt++) assert.equal((await post(url, {})).status, 400)
    assert.equal((await post(url, {})).status, 429)
  })
})
