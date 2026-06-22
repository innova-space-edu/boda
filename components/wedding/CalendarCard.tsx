export default function CalendarCard() {
  const days = Array.from({ length: 28 }, (_, index) => index + 1);
  return (
    <div className="calendar" aria-label="Calendario febrero 2027">
      <h3>Febrero <span className="gold-text">2027</span></h3>
      <div className="calendar-grid">
        {["L", "M", "M", "J", "V", "S", "D"].map((d) => <span className="dow" key={d}>{d}</span>)}
        {days.map((day) => (
          <span key={day} className={day === 6 ? "heart-day" : ""}>{day}</span>
        ))}
      </div>
    </div>
  );
}
