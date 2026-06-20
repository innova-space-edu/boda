'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarHeart, Heart, Menu, MessageCircle, X } from 'lucide-react'

const WHATSAPP_1 = '56926301822'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/#info', label: 'La Boda' },
    { href: '/quienes-somos', label: 'Quiénes Somos' },
    { href: '/confirmar', label: 'Confirmar', confirm: true },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.includes('#')) return false
    return pathname.startsWith(href)
  }

  return (
    <header className={`lux-nav ${isOpen ? 'open' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="nav-mark"><Heart size={18} fill="currentColor" /></span>
          <span className="nav-logo-text">C · E</span>
        </Link>

        <nav className="nav-links" aria-label="Navegación principal">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? 'active' : ''} ${link.confirm ? 'confirm' : ''}`}
            >
              {link.confirm ? <CalendarHeart size={15} /> : null}
              {link.label}
            </Link>
          ))}
          <a
            className="nav-link"
            href={`https://wa.me/${WHATSAPP_1}?text=${encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </nav>

        <button className="nav-toggle" onClick={() => setIsOpen(v => !v)} aria-label="Abrir menú">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className="mobile-panel" aria-label="Menú móvil">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${isActive(link.href) ? 'active' : ''} ${link.confirm ? 'confirm' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {link.confirm ? <CalendarHeart size={15} /> : null}
            {link.label}
          </Link>
        ))}
        <a
          className="nav-link"
          href={`https://wa.me/${WHATSAPP_1}?text=${encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => setIsOpen(false)}
        >
          <MessageCircle size={15} /> Contactar por WhatsApp
        </a>
      </nav>
    </header>
  )
}
