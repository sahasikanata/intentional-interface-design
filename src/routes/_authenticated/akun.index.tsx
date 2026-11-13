import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Circle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/site/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { berkasQuery, pendaftaranQuery, pesanError, profilQuery, type PendaftaranDenganGelombang } from "@/lib/akun";
import { gelombangQuery, jenisBerkasQuery, toGelombang, type JenisBerkasRow } from "@/lib/ppdb-queries";
import { statusGelombang, tanggalPanjang, tanggalPendek } from "@/lib/gelombang";
import { bisaDiubah, isianKurang, statusLabel, type StatusPendaftaran } from "@/lib/pendaftaran-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/akun/")({
  component: StatusPage,
});

function StatusPage() {
  const { user } = Route.useRouteContext();
  const p = useQuery(pendaftaranQuery(user.id));

  if (p.isPending) return <Memuat />;
  if (p.isError) return <div className="container-page py-16"><FormAlert>{pesanError(p.error)}</FormAlert></div>;
  if (!p.data) return <MulaiDaftar userId={user.id} />;
  return <Ringkasan p={p.data} />;
}

function Memuat() {
  return <div className="container-page py-20 eyebrow text-muted-foreground">Memuat…</div>;
}

function MulaiDaftar({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: gelombang = [] } = useQuery(gelombangQuery);
  const { data: profil } = useQuery(profilQuery(userId));
  const dibuka = gelombang.filter((g) => statusGelombang(toGelombang(g)) === "Dibuka");

  const mulai = useMutation({
    mutationFn: async (gelombangId: string) => {
      const g = gelombang.find((x) => x.id === gelombangId)!;
      const { error } = await supabase.from("pendaftaran").insert({
        user_id: userId,
        gelombang_id: gelombangId,
        tahun_ajaran: g.tahun_ajaran,
        nama_lengkap: profil?.nama || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["akun", userId, "pendaftaran"] });
      void navigate({ to: "/akun/formulir" });
    },
    onError: (e) => toast.error(pesanError(e)),
  });

  return (
    <section className="container-page grid gap-12 py-16 md:grid-cols-12">
      <div className="md:col-span-6">
        <p className="eyebrow text-muted-foreground">Belum ada pendaftaran</p>
        <h1 className="mt-4 font-display-tight text-4xl md:text-5xl">Pilih gelombang, lalu mulai mengisi formulir.</h1>
        <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
          Formulir bisa disimpan sebagai draf dan dilanjutkan kapan saja selama gelombang masih dibuka.
        </p>
      </div>
      <div className="md:col-span-6">
        {dibuka.length === 0 ? (
          <FormAlert tone="info">
            Saat ini belum ada gelombang yang dibuka. Lihat{" "}
            <Link to="/alur" className="link-quiet">
              jadwal gelombang
            </Link>
            .
          </FormAlert>
        ) : (
          <ul className="border-t border-foreground/80">
            {dibuka.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-6">
                <div>
                  <p className="font-display text-3xl">{g.nama}</p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    Dibuka s.d. {tanggalPendek(g.selesai)} · kuota {g.kuota}
                  </p>
                </div>
                <Button onClick={() => mulai.mutate(g.id)} disabled={mulai.isPending}>
                  {mulai.isPending ? "Menyiapkan…" : "Mulai mendaftar"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const urutanStatus: StatusPendaftaran[] = [
  "draf",
  "perlu_perbaikan",
  "menunggu_verifikasi",
  "terverifikasi",
  "cadangan",
  "tidak_diterima",
  "diterima",
  "terdaftar_ulang",
];

function Ringkasan({ p }: { p: PendaftaranDenganGelombang }) {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const { data: berkas = [] } = useQuery(berkasQuery(p.id));
  const { data: jenis = [] } = useQuery(jenisBerkasQuery);

  const status = p.status as StatusPendaftaran;
  const editable = bisaDiubah(status);
  const kurang = isianKurang(p);
  const berkasKurang = jenis.filter((j) => j.wajib && !berkas.some((b) => b.kode === j.kode));
  const siap = kurang.length === 0 && berkasKurang.length === 0;

  const ajukan = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("ajukan_pendaftaran", { _id: p.id });
      if (error) throw error;
    },
    onSuccess: async () => {
      setKonfirmasi(false);
      await queryClient.invalidateQueries({ queryKey: ["akun", user.id, "pendaftaran"] });
      toast.success("Pendaftaran terkirim. Nomor pendaftaran Anda sudah terbit.");
    },
    onError: (e) => {
      setKonfirmasi(false);
      toast.error(pesanError(e));
    },
  });

  const idx = urutanStatus.indexOf(status);
  const lewat = (s: StatusPendaftaran) => idx >= urutanStatus.indexOf(s);
  const tahap: { label: string; selesai: boolean; aktif: boolean; perhatian?: boolean }[] = [
    { label: "Formulir diisi", selesai: kurang.length === 0, aktif: editable && kurang.length > 0 },
    { label: "Berkas diunggah", selesai: berkasKurang.length === 0, aktif: editable && kurang.length === 0 && berkasKurang.length > 0 },
    { label: "Pendaftaran diajukan", selesai: !!p.nomor_pendaftaran, aktif: editable && siap && !p.nomor_pendaftaran },
    {
      label: status === "perlu_perbaikan" ? "Perlu perbaikan" : "Verifikasi panitia",
      selesai: lewat("terverifikasi"),
      aktif: status === "menunggu_verifikasi" || status === "perlu_perbaikan",
      perhatian: status === "perlu_perbaikan",
    },
    { label: "Seleksi", selesai: lewat("cadangan"), aktif: status === "terverifikasi" },
    { label: "Pengumuman hasil", selesai: lewat("cadangan"), aktif: false },
    { label: "Daftar ulang", selesai: status === "terdaftar_ulang", aktif: status === "diterima" },
  ];

  return (
    <>
      <div className="container-page py-12 print:hidden md:py-16">
        {status === "perlu_perbaikan" ? (
          <div className="mb-12 border-l-2 border-destructive bg-destructive/5 px-6 py-5">
            <p className="flex items-center gap-2 eyebrow text-destructive">
              <AlertTriangle className="size-4" /> Catatan dari panitia
            </p>
            <p className="mt-3 text-lg leading-relaxed">{p.catatan_panitia || "Ada data atau berkas yang perlu diperbaiki."}</p>
            <p className="mt-3 text-sm text-muted-foreground">Perbaiki formulir atau ganti berkas, lalu ajukan kembali.</p>
          </div>
        ) : null}

        <div className="grid border-y border-foreground/80 md:grid-cols-12">
          <div className="py-8 md:col-span-5 md:border-r md:border-border md:pr-8">
            <p className="eyebrow text-muted-foreground">Nomor pendaftaran</p>
            {p.nomor_pendaftaran ? (
              <p className="mt-4 font-mono text-3xl tracking-tight md:text-4xl">{p.nomor_pendaftaran}</p>
            ) : (
              <p className="mt-4 font-display text-2xl text-muted-foreground">Terbit setelah pendaftaran diajukan</p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-border py-8 md:col-span-7 md:border-t-0 md:pl-8">
            <div>
              <dt className="eyebrow text-muted-foreground">Status</dt>
              <dd className="mt-3">
                <StatusPill status={status} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Gelombang</dt>
              <dd className="mt-3 font-display text-2xl">{p.gelombang?.nama}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Tahun ajaran</dt>
              <dd className="mt-3 font-mono">{p.tahun_ajaran}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Diajukan</dt>
              <dd className="mt-3 font-mono">{p.diajukan_at ? tanggalPendek(p.diajukan_at.slice(0, 10)) : "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-16 grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-muted-foreground">Perjalanan pendaftaran</p>
            <ol className="mt-6">
              {tahap.map((t, i) => (
                <li key={t.label} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0">
                  {i < tahap.length - 1 ? (
                    <span className={cn("absolute top-6 left-[0.6rem] h-[calc(100%-1.25rem)] w-px", t.selesai ? "bg-primary" : "bg-border")} />
                  ) : null}
                  <span
                    className={cn(
                      "relative mt-0.5 flex size-5 items-center justify-center rounded-full border",
                      t.selesai && "border-primary bg-primary text-primary-foreground",
                      !t.selesai && t.aktif && !t.perhatian && "border-primary bg-background ring-4 ring-primary/15",
                      t.perhatian && "border-destructive bg-destructive/10 text-destructive",
                      !t.selesai && !t.aktif && "border-muted-foreground/50 bg-background",
                    )}
                  >
                    {t.selesai ? <Check className="size-3" strokeWidth={3} /> : t.aktif ? <Circle className="size-2 fill-current" /> : null}
                  </span>
                  <span className={cn("text-lg", !t.selesai && !t.aktif && "text-muted-foreground")}>{t.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="md:col-span-7">
            {editable ? (
              <div>
                <p className="eyebrow text-muted-foreground">Sebelum diajukan</p>
                <h2 className="mt-4 font-display-tight text-3xl md:text-4xl">
                  {siap ? "Semua sudah lengkap." : "Lengkapi dulu yang berikut."}
                </h2>
                <ul className="mt-8 divide-y divide-border border-y border-border">
                  <ChecklistRow
                    ok={kurang.length === 0}
                    judul="Formulir pendaftaran"
                    ket={kurang.length === 0 ? "Seluruh isian wajib terisi." : `Belum diisi: ${kurang.map((k) => k.label.toLowerCase()).join(", ")}.`}
                    to="/akun/formulir"
                    aksi={kurang.length === 0 ? "Lihat" : "Lengkapi"}
                  />
                  <ChecklistRow
                    ok={berkasKurang.length === 0}
                    judul="Berkas persyaratan"
                    ket={berkasKurang.length === 0 ? "Seluruh berkas wajib terunggah." : `Belum diunggah: ${berkasKurang.map((b: JenisBerkasRow) => b.nama).join("; ")}.`}
                    to="/akun/berkas"
                    aksi={berkasKurang.length === 0 ? "Lihat" : "Unggah"}
                  />
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Button size="lg" disabled={!siap || ajukan.isPending} onClick={() => setKonfirmasi(true)}>
                    {status === "perlu_perbaikan" ? "Ajukan kembali" : "Ajukan pendaftaran"}
                  </Button>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Setelah diajukan, data dan berkas dikunci sampai panitia selesai memeriksa.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="eyebrow text-muted-foreground">Langkah berikutnya</p>
                <h2 className="mt-4 font-display-tight text-3xl md:text-4xl">{langkahBerikutnya(status)}</h2>
                <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
                  Perubahan status akan tampil di halaman ini. Simpan nomor pendaftaran Anda untuk keperluan komunikasi
                  dengan panitia.
                </p>
                {p.nomor_pendaftaran ? (
                  <Button variant="outline" className="mt-8" onClick={() => window.print()}>
                    <Printer /> Cetak bukti pendaftaran
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {p.nomor_pendaftaran ? <BuktiCetak p={p} jenis={jenis} kodeTerunggah={berkas.map((b) => b.kode)} /> : null}

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">Ajukan pendaftaran sekarang?</AlertDialogTitle>
            <AlertDialogDescription>
              Pastikan data dan berkas sudah benar. Setelah diajukan, Anda tidak bisa mengubahnya kecuali panitia
              meminta perbaikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Periksa lagi</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                ajukan.mutate();
              }}
              disabled={ajukan.isPending}
            >
              {ajukan.isPending ? "Mengirim…" : "Ya, ajukan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function langkahBerikutnya(s: StatusPendaftaran) {
  switch (s) {
    case "menunggu_verifikasi":
      return "Panitia sedang memeriksa data dan berkas Anda.";
    case "terverifikasi":
      return "Terverifikasi. Jadwal seleksi akan muncul di sini.";
    case "diterima":
      return "Selamat, Anda diterima. Lanjutkan ke daftar ulang.";
    case "cadangan":
      return "Anda masuk daftar cadangan.";
    case "tidak_diterima":
      return "Mohon maaf, Anda belum diterima pada gelombang ini.";
    case "terdaftar_ulang":
      return "Daftar ulang selesai. Selamat datang di pondok.";
    default:
      return "";
  }
}

export function StatusPill({ status }: { status: StatusPendaftaran }) {
  const tone =
    status === "perlu_perbaikan" || status === "tidak_diterima"
      ? "border-destructive/40 text-destructive"
      : status === "draf"
        ? "border-border text-muted-foreground"
        : "border-primary/40 text-primary";
  return <span className={cn("inline-flex items-center rounded-sm border px-2.5 py-1 eyebrow", tone)}>{statusLabel[status]}</span>;
}

function ChecklistRow({
  ok,
  judul,
  ket,
  to,
  aksi,
}: {
  ok: boolean;
  judul: string;
  ket: string;
  to: "/akun/formulir" | "/akun/berkas";
  aksi: string;
}) {
  return (
    <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-3 py-5">
      <span
        className={cn(
          "mt-1 flex size-5 items-center justify-center rounded-full border",
          ok ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
        )}
      >
        {ok ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <div>
        <p className="font-medium">{judul}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ket}</p>
      </div>
      <Link to={to} className="mt-0.5 text-sm link-quiet">
        {aksi}
      </Link>
    </li>
  );
}

function BuktiCetak({ p, jenis, kodeTerunggah }: { p: PendaftaranDenganGelombang; jenis: JenisBerkasRow[]; kodeTerunggah: string[] }) {
  const baris: [string, string][] = [
    ["Nomor pendaftaran", p.nomor_pendaftaran ?? ""],
    ["Nama lengkap", p.nama_lengkap ?? ""],
    ["Jenis kelamin", p.jenis_kelamin === "L" ? "Laki-laki" : p.jenis_kelamin === "P" ? "Perempuan" : ""],
    ["Tempat, tanggal lahir", `${p.tempat_lahir ?? ""}, ${p.tanggal_lahir ? tanggalPanjang(p.tanggal_lahir) : ""}`],
    ["Perguruan tinggi", p.kampus ?? ""],
    ["Program studi / semester", `${p.prodi ?? ""} / ${p.semester ?? ""}`],
    ["NIM", p.nim ?? ""],
    ["Gelombang", `${p.gelombang?.nama ?? ""} · ${p.tahun_ajaran}`],
    ["Tanggal diajukan", p.diajukan_at ? tanggalPanjang(p.diajukan_at.slice(0, 10)) : ""],
  ];
  return (
    <div className="hidden px-10 py-8 print:block">
      <p className="eyebrow">Pondok Pesantren Bina Insani Semarang · PPDB {p.tahun_ajaran}</p>
      <h1 className="mt-4 font-display text-4xl">Bukti Pendaftaran</h1>
      <table className="mt-8 w-full border-collapse text-sm">
        <tbody>
          {baris.map(([k, v]) => (
            <tr key={k} className="border-b border-border">
              <td className="w-56 py-2.5 pr-4 text-muted-foreground">{k}</td>
              <td className="py-2.5 font-medium">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-8 eyebrow">Berkas terunggah</p>
      <ul className="mt-3 text-sm">
        {jenis.map((j) => (
          <li key={j.kode}>
            {kodeTerunggah.includes(j.kode) ? "☑" : "☐"} {j.nama}
          </li>
        ))}
      </ul>
      <p className="mt-10 text-xs text-muted-foreground">
        Dokumen ini dicetak dari sistem PPDB dan sah tanpa tanda tangan. Simpan untuk keperluan seleksi.
      </p>
    </div>
  );
}
