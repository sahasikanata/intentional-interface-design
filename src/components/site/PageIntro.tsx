import type { ReactNode } from "react";

export function PageIntro({ nomor, label, title, lead }: { nomor: string; label: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <section className="container-page pt-16 pb-14 md:pt-24 md:pb-20">
      <p className="eyebrow animate-rise text-muted-foreground">
        <span className="text-primary">{nomor}</span>
        <span className="mx-2">/</span>
        {label}
      </p>
      <h1 className="mt-6 max-w-4xl animate-rise font-display-tight text-5xl md:text-7xl [animation-delay:60ms]">{title}</h1>
      {lead ? (
        <p className="mt-8 max-w-2xl animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:120ms]">{lead}</p>
      ) : null}
    </section>
  );
}

/** Two-column section with a sticky label on the left. */
export function Ledger({ label, title, children, id }: { label: string; title?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="container-page">
      <div className="grid gap-8 border-t border-foreground/80 pt-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-8">
            <p className="eyebrow text-muted-foreground">{label}</p>
            {title ? <h2 className="mt-4 font-display-tight text-3xl md:text-4xl">{title}</h2> : null}
          </div>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}
