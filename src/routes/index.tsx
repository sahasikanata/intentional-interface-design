import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GelombangTable } from "@/components/site/GelombangTable";
import { alur, berita, kontak, waLink, TAHUN_AJARAN } from "@/data/ppdb";
import { tanggalPendek } from "@/lib/gelombang";
import halaman from "@/assets/pondok-halaman.jpg";
import mengaji from "@/assets/santri-mengaji.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PPDB Bina Insani Semarang — Mondok sambil kuliah" },
      {
        name: "description",
        content: `Penerimaan santri baru tahun ajaran ${TAHUN_AJARAN} untuk mahasiswa di Semarang. Pendaftaran dan seleksi tanpa biaya.`,
      },
      { property: "og:title", content: "PPDB Bina Insani Semarang — Mondok sambil kuliah" },
      {
        property: "og:description",
        content: "Pesantren mahasiswa di Semarang. Pendaftaran dan seleksi tanpa biaya; bayar hanya saat daftar ulang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beranda,
});

function Beranda() {
  return (
    <>
      {/* Pembuka */}
      <section className="container-page grid gap-12 pt-14 pb-20 md:pt-20 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col lg:col-span-7">
          <p className="eyebrow animate-rise text-muted-foreground">
            Penerimaan Santri Baru <span className="mx-2">·</span> Tahun Ajaran {TAHUN_AJARAN}
          </p>
          <h1 className="mt-8 animate-rise font-display-tight text-[3.4rem] sm:text-7xl xl:text-[6.4rem] [animation-delay:60ms]">
            Mondok sambil kuliah,{" "}
            <em className="font-light text-primary">di tengah kota Semarang.</em>
          </h1>
          <p className="mt-10 max-w-xl animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:120ms]">
            Bina Insani adalah pesantren untuk mahasiswa dari kampus mana pun di Semarang. Tinggal bersama, mengaji
            pagi dan malam, tetap kuliah seperti biasa. Mendaftar dan ikut seleksi tidak dipungut biaya.
          </p>
          <div className="mt-10 flex animate-rise flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:180ms]">
            <Button asChild size="lg">
              <Link to="/alur">
                Lihat cara mendaftar <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="link" size="inline">
              <a href={waLink(kontak.panitia[0].wa)} target="_blank" rel="noreferrer">
                Tanya panitia lewat WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <figure className="animate-rise lg:col-span-5 lg:pt-6 [animation-delay:120ms]">
          <img
            src={halaman}
            alt="Halaman pendopo dan masjid Pondok Pesantren Bina Insani pada pagi hari"
            width={1600}
            height={1072}
            className="aspect-[4/5] w-full rounded-sm object-cover object-[30%_50%]"
          />
          <figcaption className="mt-3 flex justify-between eyebrow text-muted-foreground">
            <span>Pendopo &amp; masjid pondok</span>
            <span>Tembalang, Semarang</span>
          </figcaption>
        </figure>
      </section>

      {/* Gelombang */}
      <section className="container-page">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display-tight text-3xl md:text-4xl">Gelombang pendaftaran</h2>
          <Link to="/alur" className="eyebrow link-quiet text-muted-foreground">
            Jadwal seleksi &amp; pengumuman →
          </Link>
        </div>
        <GelombangTable />
      </section>

      {/* Pernyataan biaya */}
      <section className="mt-28 bg-ink text-ink-foreground">
        <div className="container-page grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <p className="eyebrow text-ink-muted md:col-span-3">Soal biaya</p>
          <div className="md:col-span-9">
            <p className="font-display-tight text-5xl md:text-7xl">
              Rp0 untuk mendaftar.
              <br />
              <span className="text-ink-muted">Bayar hanya jika diterima.</span>
            </p>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Membuat akun, mengisi formulir, mengunggah berkas, hingga mengikuti seleksi semuanya gratis. Biaya baru
              dibayarkan saat daftar ulang, secara daring, dan hanya oleh calon santri yang dinyatakan diterima.
            </p>
            <Button asChild variant="onInk" className="mt-10">
              <Link to="/biaya">
                Rincian biaya daftar ulang <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Alur ringkas */}
      <section className="container-page mt-28 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-10">
            <p className="eyebrow text-muted-foreground">Alur pendaftaran</p>
            <h2 className="mt-4 font-display-tight text-4xl md:text-5xl">
              Delapan langkah, dari membuat akun sampai daftar ulang.
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
              Setiap tahap bisa dipantau dari akun Anda, termasuk catatan perbaikan dari panitia.
            </p>
            <Link to="/alur" className="mt-8 inline-flex items-center gap-2 link-quiet">
              Penjelasan lengkap tiap tahap <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <ol className="md:col-span-7">
          {alur.map((a, i) => (
            <li key={a.judul} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-border py-6 first:border-foreground/80">
              <span className="pt-1 font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-2xl">{a.judul}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{a.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Untuk siapa */}
      <section className="container-page mt-28 grid items-end gap-12 md:grid-cols-12">
        <figure className="md:col-span-5">
          <img
            src={mengaji}
            alt="Santri mahasiswa mengaji kitab di atas meja kayu"
            width={1200}
            height={1504}
            loading="lazy"
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
        </figure>
        <div className="md:col-span-7 md:pl-6">
          <p className="eyebrow text-muted-foreground">Untuk siapa</p>
          <h2 className="mt-4 font-display-tight text-4xl md:text-5xl">
            Untuk mahasiswa yang ingin kuliahnya punya <em className="text-primary">rumah</em>.
          </h2>
          <dl className="mt-10 divide-y divide-border border-y border-border">
            {[
              ["Siapa", "Mahasiswa aktif D3, D4, atau S1 dari perguruan tinggi mana pun di Semarang."],
              ["Kegiatan", "Mengaji Al-Qur'an, kajian kitab, dan madrasah diniyah di luar jam kuliah."],
              ["Seleksi", "Tes baca Al-Qur'an, tes tertulis, dan wawancara. Bisa daring atau tatap muka."],
              ["Tempat", "Kompleks pondok di Tembalang, dekat kampus-kampus besar di Semarang."],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="eyebrow pt-1 text-muted-foreground">{k}</dt>
                <dd className="leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
          <Link to="/profil" className="mt-8 inline-flex items-center gap-2 link-quiet">
            Kenali pondok &amp; jadwal harian <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Berita */}
      <section className="container-page mt-28">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/80 pb-4">
          <h2 className="font-display-tight text-3xl md:text-4xl">Kabar &amp; pengumuman</h2>
          <Link to="/berita" className="eyebrow link-quiet text-muted-foreground">
            Semua kabar →
          </Link>
        </div>
        <ul>
          {berita.map((b) => (
            <li key={b.slug} className="border-b border-border">
              <Link
                to="/berita/$slug"
                params={{ slug: b.slug }}
                className="group grid gap-2 py-6 md:grid-cols-[9rem_8rem_1fr_auto] md:items-baseline md:gap-6"
              >
                <span className="font-mono text-sm text-muted-foreground">{tanggalPendek(b.tanggal)}</span>
                <span className="eyebrow text-primary">{b.kategori}</span>
                <span className="font-display text-2xl leading-snug group-hover:text-primary">{b.judul}</span>
                <ArrowUpRight className="hidden size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:block" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
