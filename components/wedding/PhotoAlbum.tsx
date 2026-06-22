"use client";

import { QRCodeSVG } from "qrcode.react";
import type { WeddingSettings } from "@/lib/types";

export default function PhotoAlbum({ settings }: { settings: WeddingSettings }) {
  return (
    <div className="qr-box">
      <p className="kicker">Álbum de fotos</p>
      <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.4rem, 14vw, 5.2rem)" }}>Recuerdos</h2>
      <p className="body-copy" style={{ fontSize: "1.12rem" }}>
        Queremos guardar cada momento vivido junto a ustedes. Escanea el código QR o presiona el botón para subir o etiquetar tus fotos.
      </p>
      <div className="qr-wrap">
        <QRCodeSVG value={settings.photoUploadUrl} size={190} fgColor="#6f4b12" bgColor="#fffaf2" level="M" />
      </div>
      <a className="ghost-btn" href={settings.photoUploadUrl} target="_blank" rel="noreferrer">Abrir álbum</a>
    </div>
  );
}
