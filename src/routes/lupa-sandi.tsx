import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthFrame, Field, FormAlert, TextInput } from "@/components/site/form";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/lupa-sandi")({
  head: () => ({
    meta: [
      { title: "Lupa Kata Sandi — PPDB Bina Insani Semarang" },
      { name: "description", content: "Atur ulang kata sandi akun calon santri melalui email." },
      { property: "og:title", content: "Lupa Kata Sandi — PPDB Bina Insani Semarang" },
      { property: "og:description", content: "Kirim tautan atur ulang kata sandi ke email Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LupaSandi,
});

function LupaSandi() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      setError("Format email tidak valid.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error && /rate limit/i.test(error.message)) {
      setError("Terlalu banyak permintaan. Coba lagi beberapa menit lagi.");
      return;
    }
    // Same message whether or not the email exists, so accounts cannot be probed.
    setTerkirim(true);
  }

  return (
    <AuthFrame
      eyebrow="Akun calon santri"
      title="Lupa kata sandi?"
      lead="Masukkan email akun Anda. Kami kirimkan tautan untuk membuat kata sandi baru."
    >
      {terkirim ? (
        <div className="space-y-6">
          <FormAlert tone="info">
            Jika email itu terdaftar, tautan atur ulang sudah dikirim. Periksa juga folder spam.
          </FormAlert>
          <Link to="/masuk" className="link-quiet">
            Kembali ke halaman masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {error ? <FormAlert>{error}</FormAlert> : null}
          <Field label="Email" htmlFor="email">
            <TextInput id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <div className="flex flex-wrap items-center gap-6">
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Mengirim…" : "Kirim tautan"}
            </Button>
            <Link to="/masuk" className="text-sm link-quiet">
              Kembali
            </Link>
          </div>
        </form>
      )}
    </AuthFrame>
  );
}
