export interface WeddingConfig {
  id: string
  bride_name: string
  groom_name: string
  wedding_date: string
  ceremony_time: string
  venue_name: string
  venue_address: string
  city: string
  love_story: string
  bride_bio: string
  groom_bio: string
  bride_image_url: string
  groom_image_url: string
  hero_image_url: string
  bank_name: string
  account_type: string
  account_number: string
  account_holder: string
  account_rut: string
  bank_email: string
  hero_message: string
  dress_code: string
  updated_at: string
}

export interface RsvpMember {
  name: string
  attending: boolean
}

export interface RsvpResponse {
  id: string
  family_name: string
  phone: string
  email: string
  members: RsvpMember[]
  total_attending: number
  dietary_notes: string
  envelope_message: string
  will_contribute: boolean
  created_at: string
  ip_address: string
  user_agent: string
}

export interface AccessLog {
  id: string
  page: string
  ip_address: string
  user_agent: string
  created_at: string
}
