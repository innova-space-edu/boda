import { invitationImages } from "@/lib/config";
import Section from "./Section";
import RsvpForm from "./RsvpForm";

export default function RsvpStandalone() {
  return (
    <main className="site-shell">
      <Section id="confirmar" image={invitationImages.rsvp}>
        <RsvpForm />
      </Section>
    </main>
  );
}
