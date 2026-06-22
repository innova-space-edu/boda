"use client";

import { FormEvent, useEffect, useState } from "react";
import { defaultWeddingSettings } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase";
import type { WeddingSettings } from "@/lib/types";

type ResponseRow = {
  id: string;
  family_name: string;
  main_guest: string;
  attending: boolean;
  companions: string[];
  total_attending: number;
  message: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const [settings, setSettings] = useState<WeddingSettings>(defaultWeddingSettings);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [status, setStatus] = useState("");

  async function loadData() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const local = JSON.parse(window.localStorage.getItem("wedding_rsvp_responses") || "[]");
      setResponses(local.map((item: any) => ({
        id: item.id,
        family_name: item.familyName,
        main_guest: item.mainGuest,
        attending: item.attending,
        companions: item.companions || [],
        total_attending: item.totalAttending || 0,
        message: item.message || "",
        created_at: item.created_at,
      })));
      return;
    }

    const settingsResult = await supabase.from("wedding_settings").select("data").eq("id", "main").maybeSingle();
    if (settingsResult.data?.data) setSettings({ ...defaultWeddingSettings, ...settingsResult.data.data });

    const { data, error } = await supabase.from("rsvp_responses").select("*").order("created_at", { ascending: false });
    if (!error && data) setResponses(data as ResponseRow[]);
  }

  useEffect(() => { loadData(); }, []);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      window.localStorage.setItem("wedding_settings", JSON.stringify(settings));
      setStatus("Guardado localmente. Para producción configura Supabase.");
      return;
    }
    const { error } = await supabase.from("wedding_settings").upsert({ id: "main", data: settings, updated_at: new Date().toISOString() });
    setStatus(error ? error.message : "Configuración guardada correctamente.");
  }

  function update<K extends keyof WeddingSettings>(key: K, value: WeddingSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  const totalFamilies = responses.length;
  const totalConfirmed = responses.reduce((acc, row) => acc + (row.attending ? row.total_attending : 0), 0);

  return (
    <main className="site-shell">
      <section className="invitation-section soft-veiling" style={{ display: "block", padding: "28px 18px 90px", minHeight: "100svh" }}>
        <img className="section-bg" src="/invitation/01-carta-inicial.jpg" alt="" />
        <div className="content-card" style={{ width: "100%" }}>
          <p className="kicker">Panel administrativo</p>
          <h1 className="script-title gold-text" style={{ fontSize: "clamp(3.2rem, 14vw, 5rem)", textAlign: "center" }}>Boda</h1>
          <div className="detail-grid">
            <div className="detail-box"><strong>{totalFamilies}</strong><span>Familias</span></div>
            <div className="detail-box"><strong>{totalConfirmed}</strong><span>Confirmados</span></div>
          </div>
          <div className="button-row">
            <a className="ghost-btn" href="/invite" target="_blank">Ver invitación</a>
            <button className="ghost-btn" onClick={() => navigator.clipboard.writeText(`${location.origin}/invite`)}>Copiar link</button>
          </div>
        </div>

        <form className="content-card" onSubmit={saveSettings} style={{ width: "100%", marginTop: 18 }}>
          <p className="kicker">Editar datos principales</p>
          <div className="form-grid">
            <label>Nombre novia<input value={settings.brideFullName} onChange={(e) => update("brideFullName", e.target.value)} /></label>
            <label>Nombre novio<input value={settings.groomFullName} onChange={(e) => update("groomFullName", e.target.value)} /></label>
            <label>Nombre corto novia<input value={settings.brideShortName} onChange={(e) => update("brideShortName", e.target.value)} /></label>
            <label>Nombre corto novio<input value={settings.groomShortName} onChange={(e) => update("groomShortName", e.target.value)} /></label>
            <label>Fecha ISO<input value={settings.dateISO} onChange={(e) => update("dateISO", e.target.value)} /></label>
            <label>Fecha texto<input value={settings.dateText} onChange={(e) => update("dateText", e.target.value)} /></label>
            <label>Hora<input value={settings.timeText} onChange={(e) => update("timeText", e.target.value)} /></label>
            <label>Lugar<input value={settings.venue} onChange={(e) => update("venue", e.target.value)} /></label>
            <label>Ciudad<input value={settings.city} onChange={(e) => update("city", e.target.value)} /></label>
            <label>Google Maps URL<input value={settings.mapsUrl} onChange={(e) => update("mapsUrl", e.target.value)} /></label>
            <label>Link álbum / Instagram<input value={settings.photoUploadUrl} onChange={(e) => update("photoUploadUrl", e.target.value)} /></label>
            <label>WhatsApp 1<input value={settings.whatsappOne} onChange={(e) => update("whatsappOne", e.target.value)} /></label>
            <label>WhatsApp 2<input value={settings.whatsappTwo} onChange={(e) => update("whatsappTwo", e.target.value)} /></label>
            <label>Código vestimenta<input value={settings.dressCode} onChange={(e) => update("dressCode", e.target.value)} /></label>
            <label>Banco<input value={settings.bankName} onChange={(e) => update("bankName", e.target.value)} /></label>
            <label>Tipo cuenta<input value={settings.bankAccountType} onChange={(e) => update("bankAccountType", e.target.value)} /></label>
            <label>Número cuenta<input value={settings.bankAccountNumber} onChange={(e) => update("bankAccountNumber", e.target.value)} /></label>
            <label>Titular<input value={settings.bankHolder} onChange={(e) => update("bankHolder", e.target.value)} /></label>
            <label>RUT<input value={settings.bankRut} onChange={(e) => update("bankRut", e.target.value)} /></label>
            <label>Correo banco<input value={settings.bankEmail} onChange={(e) => update("bankEmail", e.target.value)} /></label>
            <label>Nuestra historia<textarea value={settings.storyText} onChange={(e) => update("storyText", e.target.value)} /></label>
            <button className="gold-btn" type="submit">Guardar cambios</button>
          </div>
          {status && <p className="status-msg">{status}</p>}
        </form>

        <div className="content-card" style={{ width: "100%", marginTop: 18 }}>
          <p className="kicker">Confirmaciones</p>
          {responses.length === 0 ? <p className="body-copy">Aún no hay respuestas.</p> : responses.map((row) => (
            <div className="bank-details" key={row.id}>
              <p><strong>{row.family_name}</strong> — {row.attending ? `${row.total_attending} asistirán` : "No asistirán"}</p>
              <p>Principal: {row.main_guest}</p>
              {row.companions?.length > 0 && <p>Acompañantes: {row.companions.join(", ")}</p>}
              {row.message && <p>Mensaje: {row.message}</p>}
              <p>{new Date(row.created_at).toLocaleString("es-CL")}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
