import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AuthFrame, Field, FormAlert, TextInput } from "@/components/site/form";
import { supabase } from "@/integrations/supabase/client";
import { amanRedirect, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/masuk")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Masuk — PPDB Bina Insani Semarang" },
      { name: "description", content: "Masuk ke akun calon santri untuk melanjutkan pendaftaran dan memantau status." },
      { property: "og:title", content: "Masuk — PPDB Bina Insani Semarang" },
      { property: "og:description", content: "Masuk ke akun calon santri PPDB Bina Insani." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Masuk,
});

function terjemahkanError(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "Email atau kata sandi salah.";
  if (/email not confirmed/i.test(msg)) return "Email belum dikonfirmasi. Buka tautan konfirmasi yang kami kirim ke email Anda.";
  if (/rate limit/i.test(msg)) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  return "Gagal masuk. Periksa koneksi Anda lalu coba lagi.";
}

function Masuk() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) void navigate({ to: amanRedirect(redirect), replace: true });
  }, [ready, session, redirect, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Isi email dan kata sandi.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(terjemahkanError(error.message));
  }

  return (
    <AuthFrame
      eyebrow="Akun calon santri"
      title="Masuk untuk melanjutkan."
      lead="Formulir yang sudah Anda simpan sebagai draf tetap ada. Lanjutkan kapan saja."
      aside={
        <div className="border-t border-foreground/80 pt-6">
          <p className="eyebrow text-muted-foreground">Belum punya akun?</p>
          <p className="mt-4 font-display text-3xl leading-tight">Membuat akun gratis dan hanya butuh satu menit.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/daftar">Daftar akun baru</Link>
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Kata sandi" htmlFor="password">
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Memproses…" : "Masuk"}
          </Button>
          <Link to="/lupa-sandi" className="text-sm link-quiet">
            Lupa kata sandi?
          </Link>
        </div>
      </form>
    </AuthFrame>
  );
}
