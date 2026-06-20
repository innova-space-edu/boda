'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Heart } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/#info', label: 'La Boda' },
    { href: '/quienes-somos', label: 'Quiénes Somos' },
    { href: '/confirmar', label: 'Confirmar Invitación', highlight: true },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('#')[0]) && href !== '/'
  }

  return (
    <header
      className={`navbar-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2 shadow-sm' : 'py-3'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Heart
            className="text-rose-400 animate-heartbeat"
            size={18}
            fill="currentColor"
          />
          <span
            className="font-display text-lg"
            style={{ color: 'var(--gold-dark)', letterSpacing: '0.05em' }}
          >
            C <span style={{ color: 'var(--rose)' }}>·</span> E
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            link.highlight ? (
              <Link
                key={link.href}
                href={link.href}
                className="btn-gold ml-2 text-xs"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  color: isActive(link.href) ? 'var(--gold-dark)' : 'var(--charcoal-muted)',
                  background: isActive(link.href) ? 'rgba(201,169,110,0.1)' : 'transparent',
                  fontWeight: isActive(link.href) ? 500 : 400,
                  letterSpacing: '0.02em',
                }}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: 'var(--charcoal-muted)' }}
          aria-label="Menú"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'var(--border)', background: 'rgba(250,247,242,0.98)' }}
        >
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-inter text-sm px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  color: link.highlight ? 'var(--gold-dark)' : 'var(--charcoal)',
                  fontWeight: link.highlight ? 600 : 400,
                  background: link.highlight ? 'rgba(201,169,110,0.08)' : 'transparent',
                  borderLeft: link.highlight ? '3px solid var(--gold)' : '3px solid transparent',
                }}
              >
                {link.highlight ? `💌 ${link.label}` : link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
