import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Ledger } from "@/components/site/PageIntro";
import { GelombangTable } from "@/components/site/GelombangTable";
import { alur, komponenSeleksi } from "@/data/ppdb";

export const Route = createFileRoute("/alur")({
  head: () => ({
    meta: [
      { title: "Alur & Jadwal PPDB — Bina Insani Semarang" },
      { name: "description", content: "Tahapan pendaftaran santri baru, jadwal tiap gelombang, komponen seleksi, dan arti setiap status." },
      { property: "og:title", content: "Alur & Jadwal PPDB — Bina Insani Semarang" },
      { property: "og:description", content: "Dari membuat akun hingga terdaftar ulang: delapan tahap, tiga gelombang." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Alur,
});

const statusDaftar = [
  { nama: "Draf", ket: "Formulir tersimpan tapi belum dikirim." },
  { nama: "Menunggu Verifikasi", ket: "Data dan berkas sudah dikirim, sedang diperiksa panitia." },
  { nama: "Perlu Perbaikan", ket: "Ada data atau berkas yang harus diganti. Baca catatan panitia." },
  { nama: "Terverifikasi", ket: "Lolos pemeriksaan. Anda akan mendapat jadwal seleksi." },
  { nama: "Diterima", ket: "Lolos seleksi dan masuk kuota gelombang. Lanjut daftar ulang." },
  { nama: "Cadangan", ket: "Bisa menggantikan peserta diterima yang tidak daftar ulang tepat waktu." },
  { nama: "Tidak Diterima", ket: "Belum lolos seleksi pada gelombang ini." },
  { nama: "Terdaftar Ulang", ket: "Pembayaran lunas dan berkas daftar ulang sudah divalidasi." },
];

function Alur() {
  return (
    <>
      <PageIntro
        nomor="02"
        label="Alur & jadwal"
        title="Satu akun, delapan tahap, semuanya terlihat dari layar Anda."
        lead="Anda tidak perlu datang ke pondok untuk mendaftar. Setiap tahap tercatat di akun, sehingga Anda selalu tahu sedang di mana dan apa yang harus dilakukan berikutnya."
      />

      <div className="space-y-24">
        <section className="container-page">
          <h2 className="mb-6 font-display-tight text-3xl md:text-4xl">Jadwal gelombang</h2>
          <GelombangTable detail />
          <p className="mt-4 text-sm text-muted-foreground">
            Pendaftaran hanya bisa dilakukan selama gelombang berstatus Dibuka. Satu calon santri hanya boleh punya satu
            pendaftaran aktif per tahun ajaran.
          </p>
        </section>

        <Ledger label="Tahapan" title="Apa yang terjadi di tiap langkah.">
          <ol>
            {alur.map((a, i) => (
              <li key={a.judul} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-border py-7 first:pt-0">
                <span className="pt-1 font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-3xl">{a.judul}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{a.isi}</p>
                </div>
              </li>
            ))}
          </ol>
        </Ledger>

        <Ledger label="Seleksi" title="Tiga komponen, satu nilai akhir.">
          <div className="space-y-8">
            {komponenSeleksi.map((k) => (
              <div key={k.nama}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl">{k.nama}</h3>
                  <span className="font-mono text-2xl text-primary">{k.bobot}%</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${k.bobot}%` }} />
                </div>
                <p className="mt-3 text-muted-foreground">{k.ket}</p>
              </div>
            ))}
            <p className="border-l-2 border-primary pl-4 leading-relaxed">
              Nilai akhir dihitung dari bobot di atas, lalu diurutkan. Peringkat teratas sesuai kuota gelombang
              dinyatakan <strong className="font-semibold">Diterima</strong>, berikutnya masuk daftar{" "}
              <strong className="font-semibold">Cadangan</strong>.
            </p>
          </div>
        </Ledger>

        <Ledger label="Arti status" title="Status yang akan Anda lihat di akun.">
          <dl className="divide-y divide-border border-y border-border">
            {statusDaftar.map((s) => (
              <div key={s.nama} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt className="font-medium">{s.nama}</dt>
                <dd className="text-muted-foreground">{s.ket}</dd>
              </div>
            ))}
          </dl>
        </Ledger>
      </div>
    </>
  );
}
