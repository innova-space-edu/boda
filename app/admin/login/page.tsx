"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL, supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    if (!supabase) {
      setMessage("Supabase todavía no está configurado. Revisa .env.local o las variables de Cloudflare.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="admin-page">
      <section className="admin-card login-card">
        <p className="eyebrow">Acceso privado</p>
        <h1 className="admin-title">Panel administrativo</h1>
        <p>Edita los textos, enlaces, imágenes, datos bancarios y revisa las confirmaciones.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          <button className="main-button" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          {message && <p className="form-message form-message--error">{message}</p>}
        </form>
      </section>
    </main>
  );
}
