import type { ReactNode } from "react";

type Props = {
  id: string;
  image: string;
  children: ReactNode;
  veil?: boolean;
  className?: string;
};

export default function Section({ id, image, children, veil = true, className = "" }: Props) {
  return (
    <section id={id} className={`invitation-section ${veil ? "soft-veiling" : ""} ${className}`}>
      <img className="section-bg" src={image} alt="" aria-hidden="true" />
      {children}
    </section>
  );
}
