'use client'
import { useEffect, useState } from 'react'
import RsvpForm from '@/components/sections/RsvpForm'
import { DEFAULT_CONFIG } from '@/lib/wedding'
import { supabase } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'
import { Heart } from 'lucide-react'

export default function InvitePage() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    supabase.from('wedding_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as WeddingConfig)
    })
    supabase.from('access_log').insert({
      page: '/invite',
      user_agent: navigator.userAgent.slice(0, 200),
    }).then(() => {})
  }, [])

  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FAF7F2 0%, #F5EFE6 100%)',
      }}
    >
      {/* Minimal header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2C1810, #1F2D20)',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={14} fill="var(--rose-muted)" color="var(--rose-muted)" />
          <span
            className="font-display"
            style={{ fontSize: '0.9rem', color: 'rgba(232,213,163,0.8)', letterSpacing: '0.15em' }}
          >
            {brideName} & {groomName}
          </span>
          <Heart size={14} fill="var(--rose-muted)" color="var(--rose-muted)" />
        </div>
        <p
          className="font-cormorant"
          style={{
            fontSize: '0.9rem', fontStyle: 'italic',
            color: 'rgba(201,169,110,0.6)',
          }}
        >
          {formatWeddingDate(config.wedding_date)} · {config.venue_name}
        </p>
      </div>

      {/* RSVP only */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <RsvpForm config={config} />
      </div>
    </main>
  )
}
