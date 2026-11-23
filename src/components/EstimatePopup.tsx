import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLocation } from 'react-router'
import { EstimateLink } from './links'

const storageKey = 'ixp-estimate-prompt'
const delay = 45_000

export function EstimatePopup({ chatOpen }: { chatOpen: boolean }) {
  const { pathname } = useLocation()
  const [engaged, setEngaged] = useState(false)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const shown = useRef(false)
  const blocked = chatOpen || ['/estimate', '/instant-quote', '/contact', '/privacy', '/terms'].includes(pathname.replace(/\/+$/, ''))

  useEffect(() => {
    function check() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 100 && window.scrollY >= Math.min(scrollable * .35, 600)) setEngaged(true)
    }
    const timeout = window.setTimeout(() => {
      window.addEventListener('scroll', check, { passive: true })
      check()
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('scroll', check)
    }
  }, [])

  useEffect(() => {
    if (blocked) { setOpen(false); return }
    if (!engaged || shown.current) return
    try {
      if (sessionStorage.getItem(storageKey)) return
      sessionStorage.setItem(storageKey, '1')
    } catch {
      // The in-memory flag still limits this tab to one display.
    }
    shown.current = true
    setOpen(true)
  }, [engaged, blocked])

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    if (!open && dialog.current?.open) dialog.current.close()
  }, [open])

  return <dialog className="estimate-popup" ref={dialog} aria-labelledby="popup-title"
    onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
    <div className="popup-inner">
      <button className="popup-close" type="button" onClick={() => setOpen(false)} aria-label="Dismiss estimate prompt"><X size={21} /></button>
      <img src="/branding/logo-compact.svg" alt="" width={50} height={49} />
      <h2 id="popup-title">Your Home Is Worth Protecting.</h2>
      <p>Planning an inspection or home maintenance project? Let us help you get started with a personalized estimate.</p>
      <div onClick={() => setOpen(false)}><EstimateLink>Get My Estimate</EstimateLink></div>
    </div>
  </dialog>
}
