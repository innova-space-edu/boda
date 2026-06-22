"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para activar el login.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
      return;
    }
    window.location.href = "/admin/dashboard";
  }

  return (
    <main className="site-shell">
      <section className="invitation-section soft-veiling">
        <img className="section-bg" src="/invitation/01-carta-inicial.jpg" alt="" />
        <form className="content-card" onSubmit={handleLogin} style={{ textAlign: "center" }}>
          <p className="kicker">Panel administrativo</p>
          <h1 className="script-title gold-text" style={{ fontSize: "clamp(3.5rem, 16vw, 5.6rem)" }}>Admin</h1>
          <div className="form-grid">
            <label>Correo<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
            <label>Contraseña<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>
            <button className="gold-btn" type="submit">Ingresar</button>
          </div>
          {status && <p className="status-msg">{status}</p>}
        </form>
      </section>
    </main>
  );
}
