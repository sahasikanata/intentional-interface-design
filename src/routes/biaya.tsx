import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Ledger } from "@/components/site/PageIntro";
import { biayaDaftarUlang, statusPembayaran } from "@/data/ppdb";
import { rupiah } from "@/lib/gelombang";

export const Route = createFileRoute("/biaya")({
  head: () => ({
    meta: [
      { title: "Biaya PPDB — Bina Insani Semarang" },
      { name: "description", content: "Pendaftaran dan seleksi gratis. Rincian biaya daftar ulang bagi calon santri yang diterima." },
      { property: "og:title", content: "Biaya PPDB — Bina Insani Semarang" },
      { property: "og:description", content: "Rp0 untuk mendaftar. Biaya hanya dibayar saat daftar ulang, setelah diterima." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Biaya,
});

function Biaya() {
  const total = biayaDaftarUlang.reduce((s, b) => s + b.jumlah, 0);
  return (
    <>
      <PageIntro
        nomor="04"
        label="Biaya"
        title={<>Gratis sampai Anda <em className="font-light text-primary">diterima.</em></>}
        lead="Tidak ada biaya formulir, biaya berkas, atau biaya tes. Tagihan baru muncul di akun Anda setelah dinyatakan diterima dan masuk tahap daftar ulang."
      />

      <section className="container-page">
        <div className="grid border-y border-foreground/80 md:grid-cols-2">
          <div className="py-10 md:border-r md:border-border md:pr-10">
            <p className="eyebrow text-muted-foreground">Tahap 1–6 · Pendaftaran s.d. pengumuman</p>
            <p className="mt-6 font-display-tight text-7xl md:text-8xl">Rp0</p>
            <p className="mt-4 text-muted-foreground">Akun, formulir, unggah berkas, verifikasi, dan seleksi.</p>
          </div>
          <div className="border-t border-border py-10 md:border-t-0 md:pl-10">
            <p className="eyebrow text-muted-foreground">Tahap 7 · Daftar ulang (hanya jika diterima)</p>
            <p className="mt-6 font-display-tight text-7xl text-primary md:text-8xl">{rupiah(total)}</p>
            <p className="mt-4 text-muted-foreground">Dibayar sekali di awal, secara daring melalui akun.</p>
          </div>
        </div>
      </section>

      <div className="mt-24 space-y-24">
        <Ledger label="Rincian daftar ulang" title="Ke mana uangnya.">
          <table className="w-full border-collapse">
            <tbody>
              {biayaDaftarUlang.map((b) => (
                <tr key={b.item} className="border-b border-border first:border-t">
                  <td className="py-5 pr-4 text-lg">{b.item}</td>
                  <td className="py-5 text-right font-mono">{rupiah(b.jumlah)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-foreground/80">
                <td className="py-5 pr-4 font-display text-2xl">Total</td>
                <td className="py-5 text-right font-mono text-lg font-medium">{rupiah(total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-6 text-sm text-muted-foreground">
            Syahriah bulan berikutnya dibayar setiap bulan selama menjadi santri. Besaran biaya dapat berubah sesuai
            keputusan pondok dan akan diumumkan sebelum gelombang dibuka.
          </p>
        </Ledger>

        <Ledger label="Cara membayar" title="Pembayaran daring, tercatat otomatis.">
          <p className="max-w-xl text-lg leading-relaxed">
            Setelah mengonfirmasi kesediaan, Anda membuat tagihan dari akun dan membayarnya lewat metode yang tersedia.
            Status pembayaran diperbarui otomatis dan bukti pembayaran bisa diunduh kapan saja.
          </p>
          <dl className="mt-10 divide-y divide-border border-y border-border">
            {statusPembayaran.map((s) => (
              <div key={s.nama} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt className="font-medium">{s.nama}</dt>
                <dd className="text-muted-foreground">{s.ket}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">
            Pondok tidak pernah meminta transfer ke rekening pribadi atau menanyakan PIN dan data kartu Anda.
          </p>
        </Ledger>
      </div>
    </>
  );
}
