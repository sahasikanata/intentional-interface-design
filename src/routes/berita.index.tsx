import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/PageIntro";
import { berita } from "@/data/ppdb";
import { tanggalPendek } from "@/lib/gelombang";

export const Route = createFileRoute("/berita/")({
  head: () => ({
    meta: [
      { title: "Berita & Pengumuman PPDB — Bina Insani Semarang" },
      { name: "description", content: "Pengumuman resmi, panduan, dan kabar terbaru seputar penerimaan santri baru Bina Insani." },
      { property: "og:title", content: "Berita & Pengumuman PPDB — Bina Insani Semarang" },
      { property: "og:description", content: "Kabar resmi panitia PPDB Pondok Pesantren Bina Insani Semarang." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BeritaList,
});

function BeritaList() {
  return (
    <>
      <PageIntro nomor="05" label="Berita" title="Kabar dari panitia." />
      <section className="container-page">
        <ul className="border-t border-foreground/80">
          {berita.map((b) => (
            <li key={b.slug} className="border-b border-border">
              <Link to="/berita/$slug" params={{ slug: b.slug }} className="group grid gap-3 py-10 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-3">
                  <p className="font-mono text-sm text-muted-foreground">{tanggalPendek(b.tanggal)}</p>
                  <p className="mt-2 eyebrow text-primary">{b.kategori}</p>
                </div>
                <div className="md:col-span-9">
                  <h2 className="font-display-tight text-3xl leading-tight group-hover:text-primary md:text-4xl">{b.judul}</h2>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{b.ringkas}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
