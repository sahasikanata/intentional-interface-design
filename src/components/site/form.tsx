import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-sm border border-input bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive";

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(control, "h-12", className)} {...props} />,
);
TextInput.displayName = "TextInput";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(control, "min-h-24 py-3 leading-relaxed", className)} {...props} />,
);
TextArea.displayName = "TextArea";

export const SelectInput = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(control, "h-12 appearance-none pr-8", className)} {...props} />,
);
SelectInput.displayName = "SelectInput";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "info"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "border-l-2 px-4 py-3 text-sm leading-relaxed",
        tone === "error" ? "border-destructive bg-destructive/5 text-destructive" : "border-primary bg-primary/5 text-foreground",
      )}
    >
      {children}
    </div>
  );
}

/** Two-column frame used by sign-in, sign-up and password pages. */
export function AuthFrame({
  eyebrow,
  title,
  lead,
  aside,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page grid gap-14 pt-14 pb-10 md:pt-20 lg:grid-cols-12">
      <div className="lg:col-span-6 xl:col-span-5">
        <p className="eyebrow animate-rise text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-6 animate-rise font-display-tight text-5xl md:text-6xl [animation-delay:60ms]">{title}</h1>
        {lead ? <p className="mt-6 animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:100ms]">{lead}</p> : null}
        <div className="mt-10 animate-rise [animation-delay:140ms]">{children}</div>
      </div>
      {aside ? <aside className="lg:col-span-5 lg:col-start-8 lg:pt-28">{aside}</aside> : null}
    </section>
  );
}
