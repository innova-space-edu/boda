"use client";

import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RsvpMember, WeddingSettings } from "@/lib/types";

const emptyMember = (): RsvpMember => ({ name: "", attending: true });

export default function RsvpForm({ settings }: { settings: WeddingSettings }) {
  const [familyName, setFamilyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [members, setMembers] = useState<RsvpMember[]>([emptyMember()]);
  const [giftInterest, setGiftInterest] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const totalAttending = useMemo(
    () => members.filter((member) => member.name.trim() && member.attending).length,
    [members]
  );

  function updateMember(index: number, updates: Partial<RsvpMember>) {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, ...updates } : member
      )
    );
  }

  function addMember() {
    setMembers((current) => [...current, emptyMember()]);
  }

  function removeMember(index: number) {
    setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const cleanMembers = members
      .map((member) => ({ name: member.name.trim(), attending: member.attending }))
      .filter((member) => member.name.length > 1);

    if (!familyName.trim() || cleanMembers.length === 0) {
      setStatus("error");
      setErrorMessage("Escribe el nombre del grupo familiar y al menos una persona.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setErrorMessage("Supabase todavía no está configurado. Revisa las variables de entorno.");
      return;
    }

    const { error } = await supabase.from("rsvp_responses").insert({
      family_name: familyName.trim(),
      contact_phone: contactPhone.trim(),
      members: cleanMembers,
      total_attending: cleanMembers.filter((member) => member.attending).length,
      gift_interest: giftInterest,
      message: message.trim()
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("success");
    setFamilyName("");
    setContactPhone("");
    setMembers([emptyMember()]);
    setGiftInterest(false);
    setMessage("");
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <label>
        Nombre del grupo familiar
        <input
          value={familyName}
          onChange={(event) => setFamilyName(event.target.value)}
          placeholder="Ej: Familia Morales Vega"
          required
        />
      </label>

      <label>
        Teléfono de contacto
        <input
          value={contactPhone}
          onChange={(event) => setContactPhone(event.target.value)}
          placeholder="Ej: +56 9 1234 5678"
        />
      </label>

      <div className="member-list">
        <div className="member-list__header">
          <span>Personas que asistirán</span>
          <button className="soft-button soft-button--small" type="button" onClick={addMember}>
            Agregar acompañante
          </button>
        </div>

        {members.map((member, index) => (
          <div className="member-row" key={`member-${index}`}>
            <input
              value={member.name}
              onChange={(event) => updateMember(index, { name: event.target.value })}
              placeholder={index === 0 ? "Nombre principal" : "Nombre acompañante"}
              required={index === 0}
            />
            <label className="checkbox-row checkbox-row--compact">
              <input
                type="checkbox"
                checked={member.attending}
                onChange={(event) => updateMember(index, { attending: event.target.checked })}
              />
              Asiste
            </label>
            {members.length > 1 && (
              <button className="icon-button" type="button" onClick={() => removeMember(index)} aria-label="Quitar acompañante">
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={giftInterest}
          onChange={(event) => setGiftInterest(event.target.checked)}
        />
        Deseo considerar la lluvia de sobres
      </label>

      {giftInterest && (
        <div className="bank-preview bank-preview--inside">
          <p>{settings.gift_text}</p>
          <div><strong>Banco:</strong> {settings.bank_name}</div>
          <div><strong>Tipo:</strong> {settings.bank_account_type}</div>
          <div><strong>Número:</strong> {settings.bank_account_number}</div>
          <div><strong>Titular:</strong> {settings.bank_account_holder}</div>
          <div><strong>RUT:</strong> {settings.bank_account_rut}</div>
          <div><strong>Correo:</strong> {settings.bank_account_email}</div>
        </div>
      )}

      <label>
        Mensaje para los novios
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escribe un mensaje breve si deseas"
          rows={4}
        />
      </label>

      <div className="rsvp-total">
        Confirmados: <strong>{totalAttending}</strong>
      </div>

      <button className="main-button" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Guardando..." : "Enviar confirmación"}
      </button>

      {status === "success" && (
        <p className="form-message form-message--success">Confirmación enviada. ¡Muchas gracias!</p>
      )}
      {status === "error" && (
        <p className="form-message form-message--error">{errorMessage}</p>
      )}
    </form>
  );
}
