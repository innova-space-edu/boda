import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carolina & Esthefano | Invitación de Boda",
  description: "Invitación religiosa y confirmación de asistencia para la boda de Carolina y Esthefano.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
