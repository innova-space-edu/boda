export type WeddingSettings = {
  [key: string]: any;
  id: string;
  photo_carousel_urls?: string;
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
