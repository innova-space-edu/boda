import { supabase } from './supabase'
import type { WeddingConfig } from '@/types'

export const DEFAULT_CONFIG: WeddingConfig = {
  id: '1',
  bride_name: 'Carolina Elizabeth Vega Carrera',
  groom_name: 'Esthefano Gonzalo Morales Campaña',
  wedding_date: '2027-02-06',
  ceremony_time: '18:00',
  venue_name: 'Catedral de Antofagasta',
  venue_address: 'Plaza España s/n',
  city: 'Antofagasta, Chile',
  love_story: 'Nuestra historia comenzó con una mirada, creció con el tiempo y hoy culmina en el día más especial de nuestras vidas. Gracias por ser parte de este momento único.',
  bride_bio: 'Carolina, con su sonrisa que ilumina cualquier habitación y su corazón lleno de amor, ha sido la luz que guía cada uno de nuestros días juntos.',
  groom_bio: 'Esthefano, apasionado, dedicado y lleno de sueños, encontró en Carolina a su compañera de vida perfecta para compartir cada aventura.',
  bride_image_url: '',
  groom_image_url: '',
  hero_image_url: '',
  bank_name: '',
  account_type: '',
  account_number: '',
  account_holder: '',
  account_rut: '',
  bank_email: '',
  hero_message: '¡Nos casamos! Únete a nosotros en el día más especial de nuestras vidas.',
  dress_code: 'Formal / Semiformal',
  updated_at: new Date().toISOString(),
}

export async function getWeddingConfig(): Promise<WeddingConfig> {
  try {
    const { data, error } = await supabase
      .from('wedding_config')
      .select('*')
      .single()

    if (error || !data) return DEFAULT_CONFIG
    return data as WeddingConfig
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function updateWeddingConfig(config: Partial<WeddingConfig>) {
  const { data, error } = await supabase
    .from('wedding_config')
    .upsert({ id: '1', ...config, updated_at: new Date().toISOString() })
    .select()
    .single()

  return { data, error }
}

export function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getCoupleName(config: WeddingConfig): string {
  const bride = config.bride_name.split(' ')[0]
  const groom = config.groom_name.split(' ')[0]
  return `${bride} & ${groom}`
}

export function getCountdown(dateStr: string) {
  const wedding = new Date(dateStr + 'T18:00:00')
  const now = new Date()
  const diff = wedding.getTime() - now.getTime()

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}
