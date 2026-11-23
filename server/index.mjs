import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateLead } from '../shared/lead.mjs'
import { bbbSeal } from '../shared/bbb-seal.mjs'
import { resendMailer } from './email.mjs'

const defaultDist = fileURLToPath(new URL('../dist/', import.meta.url))
export function createApp({ mailer = resendMailer(), dist = defaultDist, trustProxy = 0, secure = false } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', trustProxy)
  app.use(helmet({
    strictTransportSecurity: secure ? undefined : false,
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'"], 'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', bbbSeal.imageUrl],
        'upgrade-insecure-requests': secure ? [] : null
      }
    }
  }))
  app.get('/health', (_req, res) => res.json({ ok: true }))
  app.post('/api/leads', rateLimit({
    windowMs: 15 * 60_000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { message: 'Too many requests. Please wait a few minutes and try again.' }
  }), express.json({ limit: '12kb' }), async (req, res) => {
    res.set('Cache-Control', 'no-store')
    if (!req.is('application/json') || req.get('sec-fetch-site') === 'cross-site') {
      return res.status(400).json({ message: 'Invalid request.' })
    }
    const { data, errors } = validateLead(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Check the information and try again.', errors })
    if (!mailer) return res.status(503).json({ message: 'Online inquiries are temporarily unavailable. Please try again later.' })
    const supplied = req.get('idempotency-key') ?? ''
    // Reuse an in-window client timestamp so delivery retries have an identical body.
    const timestamp = req.body.submittedAt
    const parsed = typeof timestamp === 'string' && timestamp.length === 24 ? Date.parse(timestamp) : NaN
    const stableTimestamp = Math.abs(Date.now() - parsed) < 86_400_000
    const requestId = stableTimestamp && /^[0-9a-f-]{36}$/i.test(supplied) ? supplied : randomUUID()
    const submittedAt = new Date(stableTimestamp ? parsed : Date.now()).toISOString()
    const digest = createHash('sha256').update(JSON.stringify({ ...data, submittedAt })).digest('hex')
    try {
      await mailer({ ...data, submittedAt }, requestId + '-' + digest)
      return res.status(201).json({ ok: true })
    } catch {
      return res.status(502).json({ message: 'We could not send your request. Your entries are still available to retry.' })
    }
  })
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Unknown endpoint.' }))
  if (existsSync(resolve(dist, 'index.html'))) {
    app.use('/assets', express.static(resolve(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }))
    app.use(express.static(dist, { redirect: false, index: false }))
    app.get('/{*path}', (req, res) => {
      const pathname = req.path.replace(/\/+$/, '') || '/'
      if (pathname !== '/' && !/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(pathname)) {
        return res.status(404).sendFile(resolve(dist, '404.html'))
      }
      const page = resolve(dist, '.' + pathname, 'index.html')
      return existsSync(page) ? res.sendFile(page) : res.status(404).sendFile(resolve(dist, '404.html'))
    })
  }
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = error.status >= 400 && error.status < 500 ? error.status : 500
    const message = status === 413 ? 'Request is too large.' : status === 404 ? 'Page unavailable.' : 'Unable to process this request.'
    return req.path.startsWith('/api/') ? res.status(status).json({ message }) : res.status(status).send(message)
  })
  return app
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000)
  const app = createApp({ trustProxy: Number(process.env.TRUST_PROXY_HOPS || 0), secure: process.env.NODE_ENV === 'production' })
  app.listen(port, process.env.HOST || '0.0.0.0', () => console.log('IXP Homes listening on port ' + port))
}
