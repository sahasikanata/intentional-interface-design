import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, SelectInput, TextArea, TextInput } from "@/components/site/form";
import { supabase } from "@/integrations/supabase/client";
import { pendaftaranQuery, pesanError, type PendaftaranDenganGelombang } from "@/lib/akun";
import { gelombangQuery, toGelombang } from "@/lib/ppdb-queries";
import { statusGelombang } from "@/lib/gelombang";
import {
  bisaDiubah,
  formulirSchema,
  isianKurang,
  normalisasiTelepon,
  tampilNomorHp,
  type FormulirValues,
  type StatusPendaftaran,
} from "@/lib/pendaftaran-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/akun/formulir")({
  component: FormulirPage,
});

const kampusSemarang = [
  "Universitas Diponegoro",
  "UIN Walisongo Semarang",
  "Universitas Negeri Semarang",
  "Politeknik Negeri Semarang",
  "Universitas Islam Sultan Agung",
  "Universitas Dian Nuswantoro",
  "Universitas Muhammadiyah Semarang",
  "Universitas PGRI Semarang",
  "Universitas Semarang",
  "Universitas Katolik Soegijapranata",
  "Universitas Wahid Hasyim",
  "Poltekkes Kemenkes Semarang",
];

function keForm(p: PendaftaranDenganGelombang): FormulirValues {
  return {
    nama_lengkap: p.nama_lengkap ?? "",
    nik: p.nik ?? "",
    tempat_lahir: p.tempat_lahir ?? "",
    tanggal_lahir: p.tanggal_lahir ?? "",
    jenis_kelamin: (p.jenis_kelamin ?? "") as FormulirValues["jenis_kelamin"],
    alamat: p.alamat ?? "",
    kampus: p.kampus ?? "",
    prodi: p.prodi ?? "",
    semester: p.semester != null ? String(p.semester) : "",
    nim: p.nim ?? "",
    wali_nama: p.wali_nama ?? "",
    wali_hubungan: p.wali_hubungan ?? "",
    wali_telepon: p.wali_telepon ? tampilNomorHp(p.wali_telepon) : "",
    wali_alamat: p.wali_alamat ?? "",
  };
}

function keDatabase(v: FormulirValues) {
  const t = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    nama_lengkap: t(v.nama_lengkap),
    nik: t(v.nik),
    tempat_lahir: t(v.tempat_lahir),
    tanggal_lahir: t(v.tanggal_lahir),
    jenis_kelamin: v.jenis_kelamin === "" ? null : v.jenis_kelamin,
    alamat: t(v.alamat),
    kampus: t(v.kampus),
    prodi: t(v.prodi),
    semester: v.semester.trim() === "" ? null : Number(v.semester),
    nim: t(v.nim),
    wali_nama: t(v.wali_nama),
    wali_hubungan: t(v.wali_hubungan),
    wali_telepon: v.wali_telepon.trim() === "" ? null : normalisasiTelepon(v.wali_telepon),
    wali_alamat: t(v.wali_alamat),
  };
}

function FormulirPage() {
  const { user } = Route.useRouteContext();
  const p = useQuery(pendaftaranQuery(user.id));

  if (p.isPending) return <div className="container-page py-20 eyebrow text-muted-foreground">Memuat…</div>;
  if (p.isError) return <div className="container-page py-16"><FormAlert>{pesanError(p.error)}</FormAlert></div>;
  if (!p.data)
    return (
      <div className="container-page py-16">
        <FormAlert tone="info">
          Pilih gelombang terlebih dahulu di{" "}
          <Link to="/akun" className="link-quiet">
            halaman status
          </Link>
          .
        </FormAlert>
      </div>
    );
  return <Formulir key={p.data.id + p.data.updated_at} p={p.data} userId={user.id} />;
}

function Formulir({ p, userId }: { p: PendaftaranDenganGelombang; userId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = p.status as StatusPendaftaran;
  const editable = bisaDiubah(status);
  const { data: gelombang = [] } = useQuery(gelombangQuery);
  const pilihanGelombang = gelombang.filter((g) => g.id === p.gelombang_id || statusGelombang(toGelombang(g)) === "Dibuka");

  const form = useForm<FormulirValues & { gelombang_id: string }>({
    resolver: zodResolver(formulirSchema.passthrough()) as never,
    defaultValues: { ...keForm(p), gelombang_id: p.gelombang_id },
  });
  const { register, handleSubmit, formState, control } = form;
  const errors = formState.errors;
  const values = useWatch({ control });
  const kurang = isianKurang(values as Record<string, string>);

  useEffect(() => {
    if (!formState.isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [formState.isDirty]);

  const simpan = useMutation({
    mutationFn: async ({ v, lanjut }: { v: FormulirValues & { gelombang_id: string }; lanjut: boolean }) => {
      const payload = { ...keDatabase(v), ...(status === "draf" ? { gelombang_id: v.gelombang_id } : {}) };
      const { error } = await supabase.from("pendaftaran").update(payload).eq("id", p.id);
      if (error) throw error;
      return lanjut;
    },
    onSuccess: async (lanjut) => {
      await queryClient.invalidateQueries({ queryKey: ["akun", userId, "pendaftaran"] });
      toast.success("Draf tersimpan.");
      if (lanjut) void navigate({ to: "/akun/berkas" });
    },
    onError: (e) => toast.error(pesanError(e)),
  });

  const onSave = (lanjut: boolean) => handleSubmit((v) => simpan.mutate({ v, lanjut }), () => toast.error("Periksa isian yang ditandai merah."));

  const inv = (k: keyof FormulirValues) => ({ "aria-invalid": !!errors[k] });

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="container-page py-12 md:py-16">
      {!editable ? (
        <div className="mb-10">
          <FormAlert tone="info">
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4" /> Formulir terkunci karena pendaftaran sudah diajukan.
            </span>
          </FormAlert>
        </div>
      ) : null}

      <fieldset disabled={!editable || simpan.isPending} className="grid gap-14 md:grid-cols-12">
        <div className="space-y-16 md:col-span-8">
          <Bagian nomor="01" judul="Gelombang">
            <Field
              label="Gelombang pendaftaran"
              htmlFor="gelombang_id"
              hint={status === "draf" ? "Hanya gelombang yang sedang dibuka yang bisa dipilih." : "Gelombang tidak dapat diganti setelah diajukan."}
            >
              <SelectInput id="gelombang_id" disabled={status !== "draf"} {...register("gelombang_id")}>
                {pilihanGelombang.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} · {g.tahun_ajaran}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </Bagian>

          <Bagian nomor="02" judul="Biodata">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nama lengkap (sesuai KTP)" htmlFor="nama_lengkap" error={errors.nama_lengkap?.message} className="sm:col-span-2">
                <TextInput id="nama_lengkap" autoComplete="name" {...inv("nama_lengkap")} {...register("nama_lengkap")} />
              </Field>
              <Field label="NIK" htmlFor="nik" error={errors.nik?.message} hint="16 digit, tertera di KTP">
                <TextInput id="nik" inputMode="numeric" maxLength={16} {...inv("nik")} {...register("nik")} />
              </Field>
              <Field label="Jenis kelamin" error={errors.jenis_kelamin?.message}>
                <div className="flex h-12 items-center gap-6">
                  {[
                    ["L", "Laki-laki"],
                    ["P", "Perempuan"],
                  ].map(([val, lab]) => (
                    <label key={val} className="inline-flex cursor-pointer items-center gap-2.5">
                      <input type="radio" value={val} className="size-4 accent-primary" {...register("jenis_kelamin")} />
                      {lab}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Tempat lahir" htmlFor="tempat_lahir" error={errors.tempat_lahir?.message}>
                <TextInput id="tempat_lahir" {...inv("tempat_lahir")} {...register("tempat_lahir")} />
              </Field>
              <Field label="Tanggal lahir" htmlFor="tanggal_lahir" error={errors.tanggal_lahir?.message}>
                <TextInput id="tanggal_lahir" type="date" {...inv("tanggal_lahir")} {...register("tanggal_lahir")} />
              </Field>
              <Field label="Alamat sesuai KTP" htmlFor="alamat" error={errors.alamat?.message} className="sm:col-span-2">
                <TextArea id="alamat" rows={3} {...inv("alamat")} {...register("alamat")} />
              </Field>
            </div>
          </Bagian>

          <Bagian nomor="03" judul="Perguruan tinggi">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nama kampus" htmlFor="kampus" error={errors.kampus?.message} className="sm:col-span-2">
                <TextInput id="kampus" list="daftar-kampus" {...inv("kampus")} {...register("kampus")} />
                <datalist id="daftar-kampus">
                  {kampusSemarang.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </Field>
              <Field label="Program studi" htmlFor="prodi" error={errors.prodi?.message} className="sm:col-span-2">
                <TextInput id="prodi" {...inv("prodi")} {...register("prodi")} />
              </Field>
              <Field label="Semester" htmlFor="semester" error={errors.semester?.message}>
                <TextInput id="semester" inputMode="numeric" maxLength={2} {...inv("semester")} {...register("semester")} />
              </Field>
              <Field label="NIM" htmlFor="nim" error={errors.nim?.message}>
                <TextInput id="nim" {...inv("nim")} {...register("nim")} />
              </Field>
            </div>
          </Bagian>

          <Bagian nomor="04" judul="Orang tua / wali" ket="Dihubungi dalam keadaan darurat.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nama" htmlFor="wali_nama" error={errors.wali_nama?.message}>
                <TextInput id="wali_nama" {...inv("wali_nama")} {...register("wali_nama")} />
              </Field>
              <Field label="Hubungan" htmlFor="wali_hubungan" error={errors.wali_hubungan?.message}>
                <SelectInput id="wali_hubungan" {...register("wali_hubungan")}>
                  <option value="">Pilih…</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Wali">Wali</option>
                </SelectInput>
              </Field>
              <Field label="Nomor telepon / WhatsApp" htmlFor="wali_telepon" error={errors.wali_telepon?.message}>
                <TextInput id="wali_telepon" type="tel" inputMode="tel" {...inv("wali_telepon")} {...register("wali_telepon")} />
              </Field>
              <Field label="Alamat (jika berbeda)" htmlFor="wali_alamat" error={errors.wali_alamat?.message} className="sm:col-span-2">
                <TextArea id="wali_alamat" rows={2} {...inv("wali_alamat")} {...register("wali_alamat")} />
              </Field>
            </div>
          </Bagian>
        </div>

        <aside className="md:col-span-4">
          <div className="md:sticky md:top-8">
            <p className="eyebrow text-muted-foreground">Kelengkapan</p>
            <p className="mt-4 font-display-tight text-5xl">
              {13 - kurang.length}
              <span className="text-muted-foreground">/13</span>
            </p>
            <div className="mt-4 h-1.5 w-full bg-secondary">
              <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${((13 - kurang.length) / 13) * 100}%` }} />
            </div>
            {kurang.length > 0 ? (
              <ul className="mt-6 space-y-1.5 text-sm text-muted-foreground">
                {kurang.map((k) => (
                  <li key={k.key}>
                    <label htmlFor={k.key} className="cursor-pointer hover:text-foreground">
                      — {k.label}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-primary">Semua isian wajib sudah terisi.</p>
            )}

            {editable ? (
              <div className="mt-10 flex flex-col gap-3">
                <Button type="button" onClick={onSave(true)} disabled={simpan.isPending}>
                  Simpan & lanjut ke berkas
                </Button>
                <Button type="button" variant="outline" onClick={onSave(false)} disabled={simpan.isPending}>
                  {simpan.isPending ? "Menyimpan…" : "Simpan draf"}
                </Button>
                <p className={cn("text-xs text-muted-foreground", formState.isDirty && "text-clay")}>
                  {formState.isDirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan tersimpan."}
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </fieldset>
    </form>
  );
}

function Bagian({ nomor, judul, ket, children }: { nomor: string; judul: string; ket?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-8 flex items-baseline gap-4 border-b border-foreground/80 pb-4">
        <span className="font-mono text-sm text-primary">{nomor}</span>
        <h2 className="text-3xl">{judul}</h2>
        {ket ? <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">{ket}</span> : null}
      </div>
      {children}
    </section>
  );
}
