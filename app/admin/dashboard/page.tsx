"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SETTINGS } from "@/lib/defaultSettings";
import { ADMIN_EMAIL, supabase } from "@/lib/supabase";
import type { RsvpResponse, WeddingSettings } from "@/lib/types";

type SettingField = {
  key: keyof WeddingSettings;
  label: string;
  type?: "text" | "textarea" | "date" | "time";
};

const settingFields: SettingField[] = [
  { key: "bride_full_name", label: "Nombre completo novia" },
  { key: "bride_display_name", label: "Nombre corto novia" },
  { key: "groom_full_name", label: "Nombre completo novio" },
  { key: "groom_display_name", label: "Nombre corto novio" },
  { key: "wedding_date", label: "Fecha", type: "date" },
  { key: "wedding_time", label: "Hora", type: "time" },
  { key: "ceremony_place", label: "Lugar" },
  { key: "ceremony_city", label: "Ciudad" },
  { key: "ceremony_address", label: "Dirección" },
  { key: "maps_url", label: "Link Google Maps" },
  { key: "hero_subtitle", label: "Subtítulo inicial", type: "textarea" },
  { key: "invitation_phrase", label: "Frase de invitación", type: "textarea" },
  { key: "meaning_title", label: "Título significado" },
  { key: "meaning_text", label: "Texto significado", type: "textarea" },
  { key: "dress_code", label: "Código de vestimenta" },
  { key: "dress_note", label: "Nota vestimenta", type: "textarea" },
  { key: "gift_title", label: "Título regalos" },
  { key: "gift_text", label: "Texto lluvia de sobres", type: "textarea" },
  { key: "bank_name", label: "Banco" },
  { key: "bank_account_type", label: "Tipo de cuenta" },
  { key: "bank_account_number", label: "Número de cuenta" },
  { key: "bank_account_holder", label: "Titular" },
  { key: "bank_account_rut", label: "RUT titular" },
  { key: "bank_account_email", label: "Correo transferencia" },
  { key: "album_title", label: "Título álbum" },
  { key: "album_text", label: "Texto álbum", type: "textarea" },
  { key: "album_upload_url", label: "Link álbum / Instagram" },
  { key: "whatsapp_one", label: "WhatsApp 1" },
  { key: "whatsapp_two", label: "WhatsApp 2" },
  { key: "story_title", label: "Título historia" },
  { key: "story_text", label: "Texto historia", type: "textarea" },
  { key: "closing_title", label: "Título cierre" },
  { key: "closing_text", label: "Texto cierre", type: "textarea" },
  { key: "music_url", label: "Ruta o URL música" },
  { key: "hero_image_url", label: "Imagen invitación principal" },
  { key: "meaning_image_url", label: "Imagen significado" },
  { key: "story_image_1_url", label: "Imagen historia 1" },
  { key: "story_image_2_url", label: "Imagen historia 2" },
  { key: "story_image_3_url", label: "Imagen historia 3" }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [responses, setResponses] = useState<RsvpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => {
    const families = responses.length;
    const attending = responses.reduce((sum, item) => sum + (item.total_attending || 0), 0);
    const gift = responses.filter((item) => item.gift_interest).length;
    return { families, attending, gift };
  }, [responses]);

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) {
        setMessage("Supabase todavía no está configurado.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user.email;
      if (!email || email !== ADMIN_EMAIL) {
        router.push("/admin/login");
        return;
      }

      const [settingsResult, responsesResult] = await Promise.all([
        supabase.from("wedding_settings").select("*").eq("id", "main").single(),
        supabase.from("rsvp_responses").select("*").order("created_at", { ascending: false })
      ]);

      if (settingsResult.data) setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
      if (responsesResult.data) setResponses(responsesResult.data as RsvpResponse[]);
      setLoading(false);
    }

    void loadDashboard();
  }, [router]);

  function updateSetting(key: keyof WeddingSettings, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!supabase) {
      setMessage("Supabase todavía no está configurado.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("wedding_settings").upsert({
      ...settings,
      id: "main",
      updated_at: new Date().toISOString()
    });

    setSaving(false);
    setMessage(error ? error.message : "Cambios guardados correctamente.");
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function exportCsv() {
    const header = ["Fecha", "Familia", "Telefono", "Total", "Lluvia de sobres", "Integrantes", "Mensaje"];
    const rows = responses.map((item) => [
      item.created_at ?? "",
      item.family_name,
      item.contact_phone ?? "",
      String(item.total_attending ?? 0),
      item.gift_interest ? "Sí" : "No",
      item.members?.map((member) => `${member.name} (${member.attending ? "asiste" : "no asiste"})`).join(" | ") ?? "",
      item.message ?? ""
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "confirmaciones-boda.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-shell"><section className="admin-card">Cargando panel...</section></div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Carolina y Esthefano</p>
            <h1>Panel administrativo</h1>
          </div>
          <div className="button-row">
            <button className="outline-button" type="button" onClick={exportCsv}>Exportar CSV</button>
            <button className="outline-button" type="button" onClick={signOut}>Salir</button>
          </div>
        </header>

        <section className="admin-card">
          <h2>Resumen</h2>
          <div className="detail-grid">
            <div className="content-card"><h3>Familias</h3><p className="large-detail">{totals.families}</p></div>
            <div className="content-card"><h3>Total confirmado</h3><p className="large-detail">{totals.attending}</p></div>
            <div className="content-card"><h3>Lluvia de sobres</h3><p className="large-detail">{totals.gift}</p></div>
          </div>
        </section>

        <section className="admin-card">
          <h2>Editar invitación</h2>
          <p>Todos estos campos se leen en la página pública y se pueden cambiar sin tocar código.</p>
          <form className="admin-form" onSubmit={saveSettings}>
            <div className="admin-grid">
              {settingFields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      value={String(settings[field.key] ?? "")}
                      onChange={(event) => updateSetting(field.key, event.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      value={String(settings[field.key] ?? "")}
                      onChange={(event) => updateSetting(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            <button className="main-button" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>

        <section className="admin-card">
          <h2>Confirmaciones</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Integrantes</th>
                  <th>Total</th>
                  <th>Contacto</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((item) => (
                  <tr key={item.id ?? `${item.family_name}-${item.created_at}`}>
                    <td>{item.family_name}</td>
                    <td>{item.members?.map((member) => `${member.name}${member.attending ? "" : " (no asiste)"}`).join(", ")}</td>
                    <td>{item.total_attending}</td>
                    <td>{item.contact_phone}</td>
                    <td>{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
