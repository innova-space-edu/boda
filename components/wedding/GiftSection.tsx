"use client";

import { useState } from "react";
import type { WeddingSettings } from "@/lib/types";

export default function GiftSection({ settings }: { settings: WeddingSettings }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="gift-box">
      <p className="kicker">Sugerencia de regalos</p>
      <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.4rem, 14vw, 5.2rem)" }}>Lluvia</h2>
      <p className="body-copy" style={{ fontSize: "1.15rem" }}>
        Tu presencia es nuestro regalo más importante. Si deseas tener un gesto con nosotros, puedes hacerlo mediante lluvia de sobres. El monto queda completamente a tu elección.
      </p>
      <button type="button" className="ghost-btn" onClick={() => setOpen((value) => !value)}>
        {open ? "Ocultar datos" : "Ver datos de transferencia"}
      </button>

      {open && (
        <div className="bank-details">
          <p><strong>Banco:</strong> {settings.bankName}</p>
          <p><strong>Tipo de cuenta:</strong> {settings.bankAccountType}</p>
          <p><strong>Número:</strong> {settings.bankAccountNumber}</p>
          <p><strong>Titular:</strong> {settings.bankHolder}</p>
          <p><strong>RUT:</strong> {settings.bankRut}</p>
          <p><strong>Correo:</strong> {settings.bankEmail}</p>
        </div>
      )}
    </div>
  );
}
