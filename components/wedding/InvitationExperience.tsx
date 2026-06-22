"use client";

import { useEffect, useState } from "react";
import CalendarCard from "./CalendarCard";
import Countdown from "./Countdown";
import GiftSection from "./GiftSection";
import PhotoAlbum from "./PhotoAlbum";
import RsvpForm from "./RsvpForm";
import Section from "./Section";
import { defaultWeddingSettings, invitationImages, placeholderPhotos } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase";
import type { WeddingSettings } from "@/lib/types";

type Props = {
  startAtRsvp?: boolean;
};

function whatsappUrl(phone: string, names: string) {
  const text = `Hola, queremos consultar sobre la invitación de boda de ${names}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function InvitationExperience({ startAtRsvp = false }: Props) {
  const [settings, setSettings] = useState<WeddingSettings>(defaultWeddingSettings);

  useEffect(() => {
    async function loadSettings() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data } = await supabase.from("wedding_settings").select("data").eq("id", "main").maybeSingle();
      if (data?.data) setSettings({ ...defaultWeddingSettings, ...data.data });
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (startAtRsvp) {
      setTimeout(() => document.getElementById("confirmar")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [startAtRsvp]);

  const names = `${settings.brideShortName} & ${settings.groomShortName}`;

  return (
    <main className="site-shell">
      <nav className="floating-nav" aria-label="Navegación rápida">
        <a href="#invitacion">Inicio</a>
        <a href="#detalles">Fecha</a>
        <a href="#historia">Historia</a>
        <a className="primary" href="#confirmar">Confirmar</a>
      </nav>

      <Section id="abrir" image={invitationImages.cover}>
        <div className="content-clear opening-card">
          <p className="kicker">Tenemos una invitación especial para ti</p>
          <h1 className="script-title gold-text">Carolina<br />y<br />Esthefano</h1>
          <div className="separator" />
          <p className="body-copy">Con mucho amor queremos compartir contigo el inicio de nuestra nueva vida juntos.</p>
          <a className="gold-btn" href="#invitacion">Abrir invitación</a>
        </div>
      </Section>

      <Section id="invitacion" image={invitationImages.main} veil={false}>
        <div className="content-clear">
          <p className="kicker">Invitación religiosa</p>
          <p className="body-copy">Con la bendición de Dios y el amor de nuestras familias, tenemos el honor de invitarte a nuestra celebración de matrimonio.</p>
          <div className="names-stack">
            <h2 className="script-title gold-text">{settings.brideShortName}</h2>
            <div className="amp">y</div>
            <h2 className="script-title gold-text">{settings.groomShortName}</h2>
          </div>
          <p className="date-line">{settings.dateText}</p>
          <p className="time-line">{settings.timeText}</p>
          <p className="place-line">{settings.venue}<br />{settings.city}</p>
          <div className="button-row">
            <a className="gold-btn" href="#confirmar">Confirmar asistencia</a>
            <a className="ghost-btn" href={settings.mapsUrl} target="_blank" rel="noreferrer">Ver ubicación</a>
          </div>
        </div>
      </Section>

      <Section id="presentacion" image={invitationImages.presentation}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <p className="kicker">Nuestra invitación</p>
          <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.6rem, 15vw, 5.5rem)" }}>Un día para Dios</h2>
          <p className="body-copy">
            Esta invitación nace desde la fe, el amor y la gratitud. Queremos que seas parte de una ceremonia llena de significado, donde uniremos nuestras vidas ante Dios y celebraremos junto a quienes han sido parte de nuestro camino.
          </p>
          <img className="photo-oval" src={placeholderPhotos[0]} alt="Imagen referencial de boda" />
          <p className="body-copy" style={{ fontSize: "1.05rem" }}>Cada detalle fue pensado para recibirte con cariño y hacerte parte de este momento único.</p>
        </div>
      </Section>

      <Section id="detalles" image={invitationImages.details}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <CalendarCard />
          <div className="separator" />
          <div className="detail-grid">
            <div className="detail-box"><strong>Fecha</strong><span>{settings.dateText}</span></div>
            <div className="detail-box"><strong>Hora</strong><span>{settings.timeText}</span></div>
            <div className="detail-box"><strong>Lugar</strong><span>{settings.venue}</span></div>
            <div className="detail-box"><strong>Vestimenta</strong><span>{settings.dressCode}</span></div>
          </div>
        </div>
      </Section>

      <Section id="itinerario" image={invitationImages.cover}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <p className="kicker">Faltan</p>
          <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.2rem, 13vw, 5rem)" }}>Cuenta regresiva</h2>
          <Countdown targetISO={settings.dateISO} />
          <div className="timeline">
            <div className="timeline-item"><time>18:00</time><p>Ceremonia religiosa en la iglesia</p></div>
            <div className="timeline-item"><time>19:15</time><p>Fotografías y saludos familiares</p></div>
            <div className="timeline-item"><time>20:00</time><p>Recepción y celebración</p></div>
            <div className="timeline-item"><time>00:30</time><p>Despedida y agradecimientos</p></div>
          </div>
        </div>
      </Section>

      <Section id="ubicacion" image={invitationImages.details}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <p className="kicker">Ubicación</p>
          <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.6rem, 15vw, 5.5rem)" }}>La Iglesia</h2>
          <p className="body-copy">Nos encontraremos en {settings.venue}, en {settings.city}. Presiona el botón para abrir la ubicación en Google Maps.</p>
          <a className="ghost-btn" href={settings.mapsUrl} target="_blank" rel="noreferrer">Abrir Google Maps</a>
        </div>
      </Section>

      <Section id="regalos" image={invitationImages.gifts} veil={false}>
        <GiftSection settings={settings} />
      </Section>

      <Section id="album" image={invitationImages.presentation}>
        <PhotoAlbum settings={settings} />
      </Section>

      <Section id="contacto" image={invitationImages.cover}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <p className="kicker">Contáctanos</p>
          <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.6rem, 15vw, 5.5rem)" }}>WhatsApp</h2>
          <p className="body-copy">Si tienes dudas sobre la ceremonia, la ubicación o la confirmación, puedes escribirnos directamente.</p>
          <div className="button-row">
            <a className="ghost-btn" href={whatsappUrl(settings.whatsappOne, names)} target="_blank" rel="noreferrer">926301822</a>
            <a className="ghost-btn" href={whatsappUrl(settings.whatsappTwo, names)} target="_blank" rel="noreferrer">988215400</a>
          </div>
        </div>
      </Section>

      <Section id="historia" image={invitationImages.presentation}>
        <div className="content-card" style={{ textAlign: "center" }}>
          <p className="kicker">Nuestra historia</p>
          <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.6rem, 15vw, 5.5rem)" }}>Nosotros</h2>
          <p className="body-copy">{settings.storyText}</p>
          <div className="photo-grid">
            {placeholderPhotos.map((src, index) => <img key={src} src={src} alt={`Foto referencial ${index + 1}`} />)}
          </div>
          <p className="body-copy" style={{ fontSize: "1.05rem" }}>Estas imágenes son referenciales. Después pueden reemplazarse por fotos reales de los novios.</p>
        </div>
      </Section>

      <Section id="confirmar" image={invitationImages.rsvp} veil={false}>
        <RsvpForm />
      </Section>

      <Section id="gracias" image={invitationImages.thanks} veil={false}>
        <div className="content-clear" style={{ paddingTop: "38svh" }}>
          <a className="ghost-btn" href="#abrir">Volver al inicio</a>
        </div>
      </Section>

      <div className="footer-space" />
    </main>
  );
}
