import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gelombang, panitiaUtama, waLink, TAHUN_AJARAN } from "@/data/ppdb";
import { statusGelombang, tanggalPendek } from "@/lib/gelombang";

const nav = [
  { to: "/profil", label: "Profil" },
  { to: "/alur", label: "Alur & Jadwal" },
  { to: "/persyaratan", label: "Persyaratan" },
  { to: "/biaya", label: "Biaya" },
  { to: "/berita", label: "Berita" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const aktif = gelombang.find((g) => statusGelombang(g) === "Dibuka");

  return (
    <header className="relative z-40">
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-9 items-center justify-between gap-4 eyebrow">
          <span className="truncate">
            PPDB {TAHUN_AJARAN}
            {aktif ? (
              <>
                <span className="mx-2 text-ink-muted">/</span>
                {aktif.nama} dibuka s.d. {tanggalPendek(aktif.selesai)}
              </>
            ) : null}
          </span>
          <a href={waLink(panitiaUtama.wa)} target="_blank" rel="noreferrer" className="hidden shrink-0 link-quiet sm:inline">
            WA Panitia {panitiaUtama.tampil}
          </a>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="container-page flex h-20 items-center justify-between gap-6">
          <Link to="/" className="group flex items-baseline gap-3" onClick={() => setOpen(false)}>
            <span className="font-display text-[1.7rem] leading-none tracking-tight">Bina Insani</span>
            <span className="hidden eyebrow text-muted-foreground md:inline">Pesantren Mahasiswa · Semarang</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Utama">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[0.92rem] text-foreground/75 transition-colors hover:text-foreground"
                activeProps={{ className: "!text-foreground underline underline-offset-[0.6em] decoration-primary decoration-2" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button asChild size="sm">
              <Link to="/alur">Cara mendaftar</Link>
            </Button>
          </div>

          <button
            type="button"
            className="-mr-2 p-2 lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open ? (
          <nav className="border-t border-border lg:hidden" aria-label="Utama (seluler)">
            <ul className="container-page py-2">
              {nav.map((n, i) => (
                <li key={n.to} className="border-b border-border last:border-0">
                  <Link to={n.to} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4">
                    <span className="eyebrow text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-2xl">{n.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
