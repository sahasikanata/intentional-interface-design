import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AuthFrame, Field, FormAlert, TextInput } from "@/components/site/form";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** A session opened from a password-reset link carries amr method "recovery" in its token. */
function isRecoverySession(session: Session) {
  try {
    const payload = JSON.parse(atob(session.access_token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return Array.isArray(payload.amr) && payload.amr.some((a: { method?: string }) => a.method === "recovery");
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Buat Kata Sandi Baru — PPDB Bina Insani Semarang" },
      { name: "description", content: "Buat kata sandi baru untuk akun calon santri." },
      { property: "og:title", content: "Buat Kata Sandi Baru — PPDB Bina Insani Semarang" },
      { property: "og:description", content: "Atur ulang kata sandi akun calon santri." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [siap, setSiap] = useState<"menunggu" | "ok" | "invalid">("menunggu");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = (session: Session | null) => {
      if (session && isRecoverySession(session)) setSiap("ok");
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setSiap("ok");
      else ok(session);
    });
    supabase.auth.getSession().then(({ data }) => ok(data.session));
    const t = window.setTimeout(() => setSiap((s) => (s === "menunggu" ? "invalid" : s)), 5000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(t);
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Kata sandi minimal 8 karakter.");
    if (password !== konfirmasi) return setError("Kata sandi tidak sama.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(/weak|pwned|leaked/i.test(error.message) ? "Kata sandi terlalu mudah ditebak." : "Gagal menyimpan kata sandi. Minta tautan baru.");
      return;
    }
    void navigate({ to: "/akun", replace: true });
  }

  return (
    <AuthFrame eyebrow="Akun calon santri" title="Buat kata sandi baru.">
      {siap === "invalid" ? (
        <div className="space-y-6">
          <FormAlert>Tautan tidak valid atau sudah kedaluwarsa.</FormAlert>
          <Link to="/lupa-sandi" className="link-quiet">
            Minta tautan baru
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {error ? <FormAlert>{error}</FormAlert> : null}
          <Field label="Kata sandi baru" htmlFor="password" hint="Minimal 8 karakter">
            <TextInput id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Ulangi kata sandi" htmlFor="konfirmasi">
            <TextInput id="konfirmasi" type="password" autoComplete="new-password" value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" disabled={busy || siap !== "ok"}>
            {busy ? "Menyimpan…" : "Simpan kata sandi"}
          </Button>
        </form>
      )}
    </AuthFrame>
  );
}
