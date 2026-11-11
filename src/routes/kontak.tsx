import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageIntro, Ledger } from "@/components/site/PageIntro";
import { Button } from "@/components/ui/button";
import { kontak, waLink } from "@/data/ppdb";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak Panitia PPDB — Bina Insani Semarang" },
      { name: "description", content: "Alamat sekretariat, WhatsApp panitia putra dan putri, email, serta jawaban atas pertanyaan yang sering diajukan." },
      { property: "og:title", content: "Kontak Panitia PPDB — Bina Insani Semarang" },
      { property: "og:description", content: "Hubungi panitia PPDB Bina Insani lewat WhatsApp atau datang ke sekretariat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Kontak,
});

const faq = [
  ["Apakah harus mahasiswa kampus tertentu?", "Tidak. Mahasiswa aktif dari perguruan tinggi mana pun di Semarang boleh mendaftar, negeri maupun swasta."],
  ["Saya mahasiswa semester akhir, masih bisa?", "Bisa, selama masih berstatus mahasiswa aktif saat mendaftar. Sampaikan rencana kelulusan Anda saat wawancara."],
  ["Kalau tidak bisa datang saat seleksi?", "Tes baca Al-Qur'an dan wawancara dapat diikuti daring. Tautannya akan tercantum di jadwal seleksi pada akun Anda."],
  ["Kapan saya harus membayar?", "Hanya setelah dinyatakan diterima, di tahap daftar ulang. Sebelum itu tidak ada biaya apa pun."],
  ["Bagaimana jika saya masuk daftar cadangan?", "Anda bisa dipanggil bila ada calon santri diterima yang tidak menyelesaikan daftar ulang sampai batas waktu."],
];

function Kontak() {
  return (
    <>
      <PageIntro
        nomor="06"
        label="Kontak"
        title="Ada yang belum jelas? Tanya langsung ke panitia."
        lead="Panitia membalas pesan WhatsApp pada jam layanan. Untuk pertanyaan umum, coba lihat jawaban di bawah lebih dulu."
      />

      <section className="container-page">
        <div className="grid border-y border-foreground/80 md:grid-cols-2">
          {kontak.panitia.map((p, i) => (
            <div key={p.wa} className={i === 0 ? "py-10 md:border-r md:border-border md:pr-10" : "border-t border-border py-10 md:border-t-0 md:pl-10"}>
              <p className="eyebrow text-muted-foreground">{p.peran}</p>
              <p className="mt-5 font-display text-3xl">{p.nama}</p>
              <p className="mt-1 font-mono text-lg">{p.tampil}</p>
              <Button asChild className="mt-6">
                <a href={waLink(p.wa)} target="_blank" rel="noreferrer">Kirim pesan WhatsApp</a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-24 space-y-24">
        <Ledger label="Sekretariat" title="Datang langsung.">
          <dl className="divide-y divide-border border-y border-border text-lg">
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="eyebrow pt-1.5 text-muted-foreground">Alamat</dt>
              <dd>{kontak.alamat}</dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="eyebrow pt-1.5 text-muted-foreground">Jam layanan</dt>
              <dd>{kontak.jamLayanan}</dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="eyebrow pt-1.5 text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${kontak.email}`} className="link-quiet">{kontak.email}</a>
              </dd>
            </div>
          </dl>
        </Ledger>

        <Ledger label="Sering ditanyakan" title="Pertanyaan umum.">
          <div className="border-t border-foreground/80">
            {faq.map(([q, a]) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex cursor-pointer items-start justify-between gap-6 py-6">
                  <span className="font-display text-2xl leading-snug">{q}</span>
                  <Plus className="mt-1.5 size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="-mt-1 max-w-xl pb-7 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </Ledger>
      </div>
    </>
  );
}
