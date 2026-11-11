import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { berita } from "@/data/ppdb";
import { tanggalPanjang } from "@/lib/gelombang";

export const Route = createFileRoute("/berita/$slug")({
  loader: ({ params }) => {
    const item = berita.find((b) => b.slug === params.slug);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.judul} — Bina Insani` },
          { name: "description", content: loaderData.ringkas },
          { property: "og:title", content: loaderData.judul },
          { property: "og:description", content: loaderData.ringkas },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Berita tidak ditemukan — Bina Insani" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-32">
      <h1 className="font-display-tight text-5xl">Berita tidak ditemukan.</h1>
      <Link to="/berita" className="mt-6 inline-block link-quiet">Kembali ke daftar berita</Link>
    </div>
  ),
  component: BeritaDetail,
});

function BeritaDetail() {
  const b = Route.useLoaderData();
  return (
    <article className="container-page pt-14 md:pt-20">
      <Link to="/berita" className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Semua berita
      </Link>
      <div className="mt-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow text-primary">{b.kategori}</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">{tanggalPanjang(b.tanggal)}</p>
        </div>
        <div className="md:col-span-8">
          <h1 className="font-display-tight text-4xl md:text-6xl">{b.judul}</h1>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground">{b.ringkas}</p>
          <div className="mt-10 space-y-6 border-t border-border pt-10 text-lg leading-[1.75]">
            {b.isi.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
