import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bot, MessageCircle, Minus, X } from 'lucide-react'
import { Link } from 'react-router'
import { answerChat, chatGreeting, chatSteps } from '../../shared/chat.mjs'
import { newLead, newRequest, submitLead } from './lead-client'
import { track } from './tracking'

export function Chat({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [lead, setLead] = useState(newLead)
  const [answers, setAnswers] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'collect' | 'ready' | 'success' | 'declined'>('collect')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('')
  const request = useRef<ReturnType<typeof newRequest> | null>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const transcript = useRef<HTMLDivElement>(null)
  const step = chatSteps[answers.length]

  useEffect(() => {
    if (open) title.current?.focus()
  }, [open])

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight
  }, [answers, error, open, status])

  function reset() {
    setLead(newLead()); setAnswers([]); setInput(''); setStatus('collect'); setError(''); setWebsite('')
    request.current = null
  }

  function close(clear = false) {
    if (clear && !pending) reset()
    setOpen(false)
    requestAnimationFrame(() => launcher.current?.focus())
  }

  function answer(value: string) {
    if (!step || pending) return
    const result = answerChat(lead, answers.length, value)
    if (result.error) { setError(result.error); return }
    setError(''); setInput('')
    if (result.declined) { setStatus('declined'); setLead(newLead()); setAnswers([]); return }
    if (!result.lead || !result.display) return
    if (!answers.length) track('form_start', 'chat')
    setLead(result.lead)
    setAnswers([...answers, result.display])
    if (answers.length === chatSteps.length - 1) setStatus('ready')
  }

  function back() {
    setAnswers(answers.slice(0, -1)); setInput(''); setError(''); setStatus('collect')
    request.current = null
  }

  async function send() {
    if (pending) return
    setPending(true); setError('')
    try {
      request.current ??= newRequest()
      const result = await submitLead({ ...lead, website }, 'chat', request.current)
      if (result.ok) { reset(); setStatus('success') }
      else setError(result.message)
    } catch {
      setError('We couldn’t reach the server. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    answer(input)
  }

  return <div className="chat-shell">
    {open && <section className="chat-panel" aria-labelledby="chat-title" onKeyDown={(event) => { if (event.key === 'Escape') close() }}>
      <div className="chat-header"><Bot aria-hidden="true" size={22} /><h2 id="chat-title" ref={title} tabIndex={-1}>IXP Homes Assistant</h2>
        <button type="button" onClick={() => close()} aria-label="Minimize chat"><Minus size={19} /></button>
        <button type="button" onClick={() => close(true)} aria-label="Close and clear chat" disabled={pending}><X size={19} /></button></div>
      <div className="chat-transcript" role="log" aria-live="polite" ref={transcript}>
        <p className="chat-bot">{chatGreeting}</p>
        {answers.map((value, index) => <div key={chatSteps[index].field}>
          <p className="chat-bot">{chatSteps[index].prompt}</p><p className="chat-user">{value}</p></div>)}
        {status === 'collect' && step && <p className="chat-bot">{step.prompt}</p>}
        {status === 'ready' && <p className="chat-bot">Your inquiry is ready to send.</p>}
        {status === 'success' && <p className="chat-bot">Your request was received. IXP Homes will follow up using your preferred contact method.</p>}
        {status === 'declined' && <p className="chat-bot">Your inquiry was cleared. You can start over anytime.</p>}
      </div>
      <div className="chat-controls">
        {error && <p className="field-error" role="alert">{error}</p>}
        {status === 'collect' && step && <>
          {step.choices && <div className="quick-replies">{step.choices.map(([key, label]) =>
            <button type="button" key={key} onClick={() => answer(key)}>{label}</button>)}</div>}
          <form className="chat-entry" onSubmit={submit}>
            <input aria-label="Your reply" value={input} maxLength={step.field === 'details' ? 2000 : 254}
              inputMode={step.inputMode as 'email' | 'numeric' | 'tel' | undefined} onChange={(event) => setInput(event.target.value)} />
            <button type="submit" disabled={!input.trim()}>Reply</button>
          </form>
          {step.field === 'consent' && <Link className="text-link chat-privacy" to="/privacy">Privacy Policy</Link>}
        </>}
        <div className="honeypot" aria-hidden="true"><label htmlFor="chat-website">Website</label><input id="chat-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
        <div className="chat-actions">
          {answers.length > 0 && <button className="text-link" type="button" onClick={back} disabled={pending}>Back</button>}
          {status === 'ready' && <button className="button primary" type="button" onClick={send} disabled={pending}>{pending ? 'Sending…' : 'Send Inquiry'}</button>}
          {(status === 'success' || status === 'declined') && <button className="button secondary" type="button" onClick={reset}>Start Over</button>}
        </div>
      </div>
    </section>}
    {!open && <button className="chat-launcher" ref={launcher} type="button" onClick={() => { track('chat_open', 'chat'); setOpen(true) }} aria-expanded={false}>
      <MessageCircle size={21} aria-hidden="true" /><span>Chat</span></button>}
  </div>
}
