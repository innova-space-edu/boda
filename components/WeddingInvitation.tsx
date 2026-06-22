"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/defaultSettings";
import { supabase } from "@/lib/supabase";
import type { WeddingSettings } from "@/lib/types";
import { formatPhone, formatWeddingDate, getWeddingDateTime, whatsappLink } from "@/lib/wedding";
import RsvpForm from "./RsvpForm";

type InvitationMode = "full" | "confirm";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const itinerary = [
  { time: "18:00", title: "Iglesia", subtitle: "Ceremonia religiosa en la Catedral de Antofagasta" },
  { time: "19:15", title: "Fotos", subtitle: "Un momento para guardar recuerdos con nuestras familias" },
  { time: "20:00", title: "Recepción y celebración", subtitle: "Compartiremos una noche de alegría y gratitud" },
  { time: "00:30", title: "Despedida", subtitle: "Cerramos el día agradeciendo tu compañía" }
];

function calculateTimeLeft(target: Date): TimeLeft {
  const difference = Math.max(target.getTime() - new Date().getTime(), 0);
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
}

function SectionShell({
  children,
  tone = "ivory",
  className = ""
}: {
  children: React.ReactNode;
  tone?: "ivory" | "lilac";
  className?: string;
}) {
  return <section className={`section section--${tone} ${className}`}>{children}</section>;
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <div className="ornament" aria-hidden="true">✦</div>
    </div>
  );
}

function CalendarCard({ settings }: { settings: WeddingSettings }) {
  const days = Array.from({ length: 28 }, (_, index) => index + 1);
  return (
    <div className="calendar-card">
      <div className="calendar-month">
        <span>Febrero</span>
        <strong>2027</strong>
      </div>
      <div className="calendar-weekdays">
        {"LMMJVSD".split("").map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => (
          <span className={day === 6 ? "calendar-day calendar-day--selected" : "calendar-day"} key={day}>
            {day === 6 ? "♥" : day}
            {day === 6 && <small>6</small>}
          </span>
        ))}
      </div>
      <p className="calendar-note">{formatWeddingDate(settings.wedding_date)}</p>
      <p className="calendar-hour">{settings.wedding_time} hrs</p>
    </div>
  );
}

function Countdown({ settings }: { settings: WeddingSettings }) {
  const target = useMemo(() => getWeddingDateTime(settings.wedding_date, settings.wedding_time), [settings]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return (
    <div className="countdown-grid">
      <div><strong>{timeLeft.days}</strong><span>Días</span></div>
      <div><strong>{timeLeft.hours}</strong><span>Horas</span></div>
      <div><strong>{timeLeft.minutes}</strong><span>Minutos</span></div>
      <div><strong>{timeLeft.seconds}</strong><span>Segundos</span></div>
    </div>
  );
}

function ImageCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="image-card">
      <img src={src} alt={alt} />
    </div>
  );
}

export default function WeddingInvitation({ mode }: { mode: InvitationMode }) {
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [opened, setOpened] = useState(mode === "confirm");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!supabase) return;
      const { data } = await supabase.from("wedding_settings").select("*").eq("id", "main").single();
      if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
    }
    void loadSettings();
  }, []);

  useEffect(() => {
    async function makeQr() {
      try {
        const qr = await QRCode.toDataURL(settings.album_upload_url || "https://www.instagram.com/", {
          margin: 1,
          width: 260,
          color: {
            dark: "#7b4c9e",
            light: "#fffaf4"
          }
        });
        setQrUrl(qr);
      } catch {
        setQrUrl("");
      }
    }
    void makeQr();
  }, [settings.album_upload_url]);

  async function openInvitation() {
    setOpened(true);
    try {
      await audioRef.current?.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
    window.setTimeout(() => nextSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 220);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  }

  const whatsappMessage = `Hola, somos invitados a la boda de ${settings.bride_display_name} y ${settings.groom_display_name}. Queremos hacer una consulta.`;

  if (mode === "confirm") {
    return (
      <main className="invitation-page">
        <SectionShell tone="lilac" className="section--form-only">
          <SectionHeading
            eyebrow="Confirmación"
            title="Confirma tu asistencia"
            subtitle="Escribe los nombres de quienes asistirán y agrega acompañantes si corresponde."
          />
          <div className="content-card content-card--wide">
            <RsvpForm settings={settings} />
          </div>
        </SectionShell>
      </main>
    );
  }

  return (
    <main className="invitation-page">
      <audio ref={audioRef} src={settings.music_url || "/music/wedding-song.mp3"} loop preload="none" />

      {opened && (
        <button className="music-toggle" onClick={toggleMusic} type="button">
          {musicPlaying ? "Pausar música" : "Reproducir música"}
        </button>
      )}

      <section className="opening-section">
        <div className="opening-card">
          <p className="eyebrow">Invitación religiosa</p>
          <div className="monogram">C · E</div>
          <h1>{settings.bride_display_name} <span>y</span> {settings.groom_display_name}</h1>
          <p>{settings.hero_subtitle}</p>
          <button className="main-button" type="button" onClick={openInvitation}>
            Abrir invitación
          </button>
        </div>
      </section>

      <SectionShell tone="ivory" className={opened ? "section--visible" : "section--locked"}>
        <div ref={(element) => { nextSectionRef.current = element; }} />
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Con mucho amor</p>
            <h2 className="names-title">
              {settings.bride_display_name}
              <span>y</span>
              {settings.groom_display_name}
            </h2>
            <p className="full-names">
              {settings.bride_full_name}<br />{settings.groom_full_name}
            </p>
            <p className="invitation-text">{settings.invitation_phrase}</p>
            <div className="date-line">{formatWeddingDate(settings.wedding_date)}</div>
            <div className="hero-hour">{settings.wedding_time} hrs</div>
            <div className="place-line">{settings.ceremony_place} · {settings.ceremony_city}</div>
            <div className="button-row">
              <a className="outline-button" href="#confirmacion">Confirmar asistencia</a>
              <a className="outline-button" href={settings.maps_url} target="_blank" rel="noreferrer">Ver ubicación</a>
            </div>
          </div>
          <ImageCard src={settings.hero_image_url} alt="Imagen de boda" />
        </div>
      </SectionShell>

      <SectionShell tone="lilac">
        <SectionHeading
          eyebrow="Nuestro significado"
          title={settings.meaning_title}
          subtitle="Una celebración con fe, familia y gratitud."
        />
        <div className="split-layout">
          <ImageCard src={settings.meaning_image_url} alt="Detalle de boda" />
          <div className="content-card">
            <p>{settings.meaning_text}</p>
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="ivory">
        <SectionHeading
          eyebrow="Fecha reservada"
          title="Calendario"
          subtitle="El día que esperamos compartir contigo."
        />
        <CalendarCard settings={settings} />
      </SectionShell>

      <SectionShell tone="lilac">
        <SectionHeading
          eyebrow="Faltan"
          title="Cuenta regresiva"
          subtitle="Cada día nos acerca más a este momento."
        />
        <Countdown settings={settings} />
        <div className="itinerary-card">
          <h3>Itinerario</h3>
          {itinerary.map((item) => (
            <div className="itinerary-item" key={item.title}>
              <span>{item.time}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="ivory">
        <SectionHeading
          eyebrow="Lugar"
          title="Ubicación"
          subtitle={`${settings.ceremony_place} · ${settings.ceremony_city}`}
        />
        <div className="content-card location-card">
          <p>{settings.ceremony_address}</p>
          <a className="outline-button outline-button--large" href={settings.maps_url} target="_blank" rel="noreferrer">
            Abrir en Google Maps
          </a>
        </div>
      </SectionShell>

      <SectionShell tone="lilac">
        <SectionHeading
          eyebrow="Detalles"
          title="Vestimenta y regalos"
          subtitle="Indicaciones pensadas con cariño para nuestros invitados."
        />
        <div className="detail-grid">
          <div className="content-card">
            <h3>Código de vestimenta</h3>
            <p className="large-detail">{settings.dress_code}</p>
            <p>{settings.dress_note}</p>
          </div>
          <div className="content-card">
            <h3>{settings.gift_title}</h3>
            <p>{settings.gift_text}</p>
            <button className="outline-button" type="button" onClick={() => setShowBank((value) => !value)}>
              {showBank ? "Ocultar datos" : "Ver datos de transferencia"}
            </button>
            {showBank && (
              <div className="bank-preview">
                <div><strong>Banco:</strong> {settings.bank_name}</div>
                <div><strong>Tipo:</strong> {settings.bank_account_type}</div>
                <div><strong>Número:</strong> {settings.bank_account_number}</div>
                <div><strong>Titular:</strong> {settings.bank_account_holder}</div>
                <div><strong>RUT:</strong> {settings.bank_account_rut}</div>
                <div><strong>Correo:</strong> {settings.bank_account_email}</div>
              </div>
            )}
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="ivory">
        <SectionHeading
          eyebrow="Recuerdos"
          title={settings.album_title}
          subtitle={settings.album_text}
        />
        <div className="detail-grid">
          <div className="content-card qr-card">
            {qrUrl ? <img src={qrUrl} alt="Código QR para subir fotos" /> : <div className="qr-placeholder">QR</div>}
            <a className="outline-button" href={settings.album_upload_url} target="_blank" rel="noreferrer">
              Abrir álbum
            </a>
          </div>
          <div className="content-card contact-card">
            <h3>Contáctanos</h3>
            <a className="whatsapp-button" href={whatsappLink(settings.whatsapp_one, whatsappMessage)} target="_blank" rel="noreferrer">
              WhatsApp {formatPhone(settings.whatsapp_one)}
            </a>
            <a className="whatsapp-button" href={whatsappLink(settings.whatsapp_two, whatsappMessage)} target="_blank" rel="noreferrer">
              WhatsApp {formatPhone(settings.whatsapp_two)}
            </a>
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="lilac">
        <SectionHeading
          eyebrow="Camino compartido"
          title={settings.story_title}
          subtitle={settings.story_text}
        />
        <div className="photo-grid">
          <ImageCard src={settings.story_image_1_url} alt="Historia de los novios" />
          <ImageCard src={settings.story_image_2_url} alt="Historia de los novios" />
          <ImageCard src={settings.story_image_3_url} alt="Historia de los novios" />
        </div>
      </SectionShell>

      <SectionShell tone="ivory" className="section--confirmation" >
        <div id="confirmacion" />
        <SectionHeading
          eyebrow="Asistencia"
          title="Confirma tu asistencia"
          subtitle="Escribe los nombres de quienes asistirán y agrega acompañantes si corresponde."
        />
        <div className="content-card content-card--wide">
          <RsvpForm settings={settings} />
        </div>
      </SectionShell>

      <SectionShell tone="lilac" className="closing-section">
        <div className="closing-card">
          <p className="eyebrow">Con cariño</p>
          <h2>{settings.closing_title}</h2>
          <p>{settings.closing_text}</p>
          <div className="closing-names">{settings.bride_display_name} y {settings.groom_display_name}</div>
        </div>
      </SectionShell>
    </main>
  );
}
