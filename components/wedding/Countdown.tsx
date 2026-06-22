"use client";

import { useEffect, useState } from "react";

function diffTo(targetISO: string) {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ targetISO }: { targetISO: string }) {
  const [time, setTime] = useState(() => diffTo(targetISO));

  useEffect(() => {
    const id = window.setInterval(() => setTime(diffTo(targetISO)), 1000);
    return () => window.clearInterval(id);
  }, [targetISO]);

  return (
    <div className="countdown" aria-label="Cuenta regresiva para la boda">
      <div><strong>{time.days}</strong><span>Días</span></div>
      <div><strong>{String(time.hours).padStart(2, "0")}</strong><span>Horas</span></div>
      <div><strong>{String(time.minutes).padStart(2, "0")}</strong><span>Min</span></div>
      <div><strong>{String(time.seconds).padStart(2, "0")}</strong><span>Seg</span></div>
    </div>
  );
}
