import { Link } from "@tanstack/react-router";
import { kontak, waLink } from "@/data/ppdb";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-ink text-ink-foreground print:hidden">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p dir="rtl" lang="ar" className="font-arabic text-4xl leading-snug text-sand">
            طَلَبُ الْعِلْمِ فَرِيْضَةٌ عَلَى كُلِّ مُسْلِمٍ
          </p>
          <p className="mt-3 max-w-sm text-sm text-ink-muted">
            “Menuntut ilmu itu wajib bagi setiap muslim.” — HR. Ibnu Majah
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-ink-muted">Sekretariat PPDB</p>
          <p className="mt-4 leading-relaxed">{kontak.alamat}</p>
          <p className="mt-4 text-sm text-ink-muted">{kontak.jamLayanan}</p>
          <a href={`mailto:${kontak.email}`} className="mt-1 inline-block text-sm link-quiet">
            {kontak.email}
          </a>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-ink-muted">WhatsApp panitia</p>
          <ul className="mt-4 space-y-3">
            {kontak.panitia.map((p) => (
              <li key={p.wa}>
                <a href={waLink(p.wa)} target="_blank" rel="noreferrer" className="font-mono text-[0.95rem] link-quiet">
                  {p.tampil}
                </a>
                <p className="text-sm text-ink-muted">{p.peran}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Pondok Pesantren Bina Insani Semarang</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            <Link to="/alur" className="hover:text-ink-foreground">Alur</Link>
            <Link to="/persyaratan" className="hover:text-ink-foreground">Persyaratan</Link>
            <Link to="/biaya" className="hover:text-ink-foreground">Biaya</Link>
            <Link to="/berita" className="hover:text-ink-foreground">Berita</Link>
            <Link to="/kontak" className="hover:text-ink-foreground">Kontak</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
