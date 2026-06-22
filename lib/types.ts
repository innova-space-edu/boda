export type WeddingSettings = {
  brideFullName: string;
  groomFullName: string;
  brideShortName: string;
  groomShortName: string;
  dateISO: string;
  dateText: string;
  timeText: string;
  venue: string;
  city: string;
  mapsUrl: string;
  whatsappOne: string;
  whatsappTwo: string;
  photoUploadUrl: string;
  dressCode: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankHolder: string;
  bankRut: string;
  bankEmail: string;
  storyText: string;
};

export type RsvpPayload = {
  familyName: string;
  mainGuest: string;
  attending: boolean;
  companions: string[];
  message?: string;
  totalAttending: number;
};
