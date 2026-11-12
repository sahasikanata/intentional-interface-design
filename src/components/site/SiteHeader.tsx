import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { panitiaUtama, waLink, TAHUN_AJARAN } from "@/data/ppdb";
import { statusGelombang, tanggalPendek } from "@/lib/gelombang";
import { gelombangQuery, toGelombang } from "@/lib/ppdb-queries";
import { useAuth } from "@/lib/auth";

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
  const { data } = useSuspenseQuery(gelombangQuery);
  const aktif = data.map(toGelombang).find((g) => statusGelombang(g) === "Dibuka");
  const { session } = useAuth();

  return (
    <header className="relative z-40 print:hidden">
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

          <div className="hidden items-center gap-5 lg:flex">
            {session ? (
              <Button asChild size="sm">
                <Link to="/akun">Akun saya</Link>
              </Button>
            ) : (
              <>
                <Link to="/masuk" className="text-[0.92rem] link-quiet">
                  Masuk
                </Link>
                <Button asChild size="sm">
                  <Link to="/daftar">Daftar akun</Link>
                </Button>
              </>
            )}
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
              <li className="flex gap-3 py-5">
                {session ? (
                  <Button asChild className="flex-1">
                    <Link to="/akun" onClick={() => setOpen(false)}>Akun saya</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="flex-1">
                      <Link to="/masuk" onClick={() => setOpen(false)}>Masuk</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link to="/daftar" onClick={() => setOpen(false)}>Daftar akun</Link>
                    </Button>
                  </>
                )}
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
