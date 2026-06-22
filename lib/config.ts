import type { WeddingSettings } from "./types";

export const defaultWeddingSettings: WeddingSettings = {
  brideFullName: "Carolina Elizabeth Vega Carrera",
  groomFullName: "Esthefano Gonzalo Morales Campaña",
  brideShortName: "Carolina",
  groomShortName: "Esthefano",
  dateISO: "2027-02-06T18:00:00-03:00",
  dateText: "Sábado 6 de febrero de 2027",
  timeText: "18:00 hrs",
  venue: "Catedral de Antofagasta",
  city: "Antofagasta, Chile",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Catedral%20de%20Antofagasta%20Antofagasta%20Chile",
  whatsappOne: "56926301822",
  whatsappTwo: "56988215400",
  photoUploadUrl: "https://www.instagram.com/",
  dressCode: "Formal elegante",
  bankName: "Por definir",
  bankAccountType: "Por definir",
  bankAccountNumber: "Por definir",
  bankHolder: "Por definir",
  bankRut: "Por definir",
  bankEmail: "Por definir",
  storyText:
    "Nuestra historia comenzó con una mirada, creció con el tiempo y hoy llega a un día que queremos vivir junto a las personas que más amamos.",
};

export const invitationImages = {
  cover: "/invitation/01-carta-inicial.jpg",
  main: "/invitation/02-invitacion-fondo.jpg",
  presentation: "/invitation/03-presentacion-fondo.jpg",
  details: "/invitation/04-detalles-fondo.jpg",
  rsvp: "/invitation/05-confirmacion-fondo.jpg",
  gifts: "/invitation/06-lluvia-sobres-fondo.jpg",
  thanks: "/invitation/07-cierre-fondo.jpg",
};

export const placeholderPhotos = [
  "/placeholders/couple-01.jpg",
  "/placeholders/couple-02.jpg",
  "/placeholders/couple-03.jpg",
  "/placeholders/ceremony-01.jpg",
];
