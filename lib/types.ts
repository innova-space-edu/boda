export type WeddingSettings = {
  id: string;
  bride_full_name: string;
  bride_display_name: string;
  groom_full_name: string;
  groom_display_name: string;
  wedding_date: string;
  wedding_time: string;
  ceremony_place: string;
  ceremony_city: string;
  ceremony_address: string;
  maps_url: string;
  hero_subtitle: string;
  invitation_phrase: string;
  meaning_title: string;
  meaning_text: string;
  dress_code: string;
  dress_note: string;
  gift_title: string;
  gift_text: string;
  bank_name: string;
  bank_account_type: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_account_rut: string;
  bank_account_email: string;
  album_title: string;
  album_text: string;
  album_upload_url: string;
  whatsapp_one: string;
  whatsapp_two: string;
  story_title: string;
  story_text: string;
  closing_title: string;
  closing_text: string;
  music_url: string;
  hero_image_url: string;
  meaning_image_url: string;
  story_image_1_url: string;
  story_image_2_url: string;
  story_image_3_url: string;
  updated_at?: string;
};

export type RsvpMember = {
  name: string;
  attending: boolean;
};

export type RsvpResponse = {
  id?: string;
  family_name: string;
  contact_phone?: string;
  members: RsvpMember[];
  total_attending: number;
  gift_interest: boolean;
  message?: string;
  created_at?: string;
};
