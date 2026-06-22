"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { RsvpPayload } from "@/lib/types";

export default function RsvpForm({ compact = false }: { compact?: boolean }) {
  const [familyName, setFamilyName] = useState("");
  const [mainGuest, setMainGuest] = useState("");
  const [attending, setAttending] = useState("yes");
  const [companions, setCompanions] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function updateCompanion(index: number, value: string) {
    setCompanions((current) => current.map((item, i) => (i === index ? value : item)));
  }

  function addCompanion() {
    setCompanions((current) => [...current, ""]);
  }

  function removeCompanion(index: number) {
    setCompanions((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");

    const cleanedCompanions = companions.map((item) => item.trim()).filter(Boolean);
    const isAttending = attending === "yes";
    const payload: RsvpPayload = {
      familyName: familyName.trim(),
      mainGuest: mainGuest.trim(),
      attending: isAttending,
      companions: cleanedCompanions,
      message: message.trim(),
      totalAttending: isAttending ? 1 + cleanedCompanions.length : 0,
    };

    if (!payload.familyName || !payload.mainGuest) {
      setStatus("Completa el nombre familiar y el nombre principal para confirmar.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("rsvp_responses").insert({
          family_name: payload.familyName,
          main_guest: payload.mainGuest,
          attending: payload.attending,
          companions: payload.companions,
          total_attending: payload.totalAttending,
          message: payload.message,
        });
        if (error) throw error;
      } else {
        const stored = JSON.parse(window.localStorage.getItem("wedding_rsvp_responses") || "[]");
        stored.push({ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() });
        window.localStorage.setItem("wedding_rsvp_responses", JSON.stringify(stored));
      }

      setStatus("Confirmación enviada con amor. ¡Gracias por responder! ♡");
      setFamilyName("");
      setMainGuest("");
      setAttending("yes");
      setCompanions([""]);
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo guardar la confirmación. Revisa Supabase o intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={`rsvp-box ${compact ? "compact-rsvp" : ""}`} onSubmit={handleSubmit}>
      <p className="kicker">Confirma tu asistencia</p>
      <h2 className="script-title gold-text" style={{ fontSize: "clamp(3.5rem, 15vw, 5.8rem)" }}>Asistencia</h2>
      <p className="body-copy" style={{ fontSize: "1.15rem" }}>
        Escríbenos quiénes asistirán. Si vienes con familia o acompañantes, puedes agregarlos aquí.
      </p>

      <div className="form-grid">
        <label>
          Nombre del núcleo familiar
          <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Ej: Familia Morales" />
        </label>
        <label>
          Nombre principal
          <input value={mainGuest} onChange={(e) => setMainGuest(e.target.value)} placeholder="Nombre y apellido" />
        </label>
        <label>
          ¿Asistirán?
          <select value={attending} onChange={(e) => setAttending(e.target.value)}>
            <option value="yes">Sí, asistiremos</option>
            <option value="no">No podremos asistir</option>
          </select>
        </label>

        {attending === "yes" && (
          <div>
            <label>Acompañantes / integrantes</label>
            {companions.map((companion, index) => (
              <div className="companion-row" key={index}>
                <input value={companion} onChange={(e) => updateCompanion(index, e.target.value)} placeholder={`Acompañante ${index + 1}`} />
                {companions.length > 1 && <button className="small-btn" type="button" onClick={() => removeCompanion(index)}>Quitar</button>}
              </div>
            ))}
            <button className="small-btn" type="button" onClick={addCompanion} style={{ marginTop: 8 }}>+ Agregar acompañante</button>
          </div>
        )}

        <label>
          Mensaje para los novios
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Opcional" />
        </label>

        <button className="gold-btn" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Enviar confirmación"}
        </button>
      </div>
      {status && <p className="status-msg">{status}</p>}
    </form>
  );
}
