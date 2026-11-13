import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthFrame, Field, FormAlert, TextInput } from "@/components/site/form";
import { supabase } from "@/integrations/supabase/client";
import { daftarAkunSchema, normalisasiNomorHp } from "@/lib/pendaftaran-rules";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftar Akun — PPDB Bina Insani Semarang" },
      { name: "description", content: "Buat akun calon santri untuk mengisi formulir pendaftaran dan mengunggah berkas." },
      { property: "og:title", content: "Daftar Akun — PPDB Bina Insani Semarang" },
      { property: "og:description", content: "Langkah pertama mendaftar sebagai santri Bina Insani: buat akun." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Daftar,
});

type Values = z.infer<typeof daftarAkunSchema>;

function Daftar() {
  const [terkirim, setTerkirim] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(daftarAkunSchema) });

  async function onSubmit(v: Values) {
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: v.email.trim(),
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/masuk`,
        data: { nama: v.nama.trim(), whatsapp: normalisasiNomorHp(v.whatsapp) },
      },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) setError("Email ini sudah terdaftar. Silakan masuk.");
      else if (/rate limit/i.test(error.message)) setError("Terlalu banyak percobaan. Coba lagi beberapa menit lagi.");
      else if (/weak|pwned|leaked/i.test(error.message)) setError("Kata sandi terlalu mudah ditebak. Gunakan kombinasi lain.");
      else setError("Pendaftaran akun gagal. Coba lagi.");
      return;
    }
    // With email confirmation on, an already-registered email returns a user without identities.
    if (data.user && data.user.identities?.length === 0) {
      setError("Email ini sudah terdaftar. Silakan masuk.");
      return;
    }
    setTerkirim(v.email.trim());
  }

  if (terkirim) {
    return (
      <AuthFrame
        eyebrow="Satu langkah lagi"
        title="Cek email Anda."
        lead={
          <>
            Kami mengirim tautan konfirmasi ke <strong className="font-medium text-foreground">{terkirim}</strong>. Buka
            tautan itu untuk mengaktifkan akun, lalu masuk dan mulai mengisi formulir.
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Tidak ada di kotak masuk? Periksa folder spam atau promosi.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/masuk">Ke halaman masuk</Link>
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      eyebrow="Langkah 01 · Buat akun"
      title="Buat akun calon santri."
      lead="Satu akun untuk satu calon santri. Gunakan email dan nomor WhatsApp yang aktif — kabar dari panitia dikirim ke sana."
      aside={
        <div className="border-t border-foreground/80 pt-6">
          <p className="eyebrow text-muted-foreground">Setelah ini</p>
          <ol className="mt-5 space-y-4">
            {["Isi formulir pendaftaran", "Unggah berkas persyaratan", "Ajukan dan dapatkan nomor pendaftaran"].map((t, i) => (
              <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="font-mono text-sm text-primary">{String(i + 2).padStart(2, "0")}</span>
                <span className="font-display text-2xl leading-snug">{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/masuk" className="link-quiet text-foreground">
              Masuk
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field label="Nama lengkap" htmlFor="nama" error={errors.nama?.message}>
          <TextInput id="nama" autoComplete="name" aria-invalid={!!errors.nama} {...register("nama")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <TextInput id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Nomor WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message} hint="Contoh: 0812 3456 7890">
          <TextInput id="whatsapp" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.whatsapp} {...register("whatsapp")} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Kata sandi" htmlFor="password" error={errors.password?.message} hint="Minimal 8 karakter">
            <TextInput id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
          </Field>
          <Field label="Ulangi kata sandi" htmlFor="konfirmasi" error={errors.konfirmasi?.message}>
            <TextInput id="konfirmasi" type="password" autoComplete="new-password" aria-invalid={!!errors.konfirmasi} {...register("konfirmasi")} />
          </Field>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Memproses…" : "Buat akun"}
        </Button>
      </form>
    </AuthFrame>
  );
}
