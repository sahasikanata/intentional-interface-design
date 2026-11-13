import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profilQuery } from "@/lib/akun";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({
    meta: [
      { title: "Akun Calon Santri — PPDB Bina Insani" },
      { name: "description", content: "Formulir, berkas, dan status pendaftaran calon santri Bina Insani." },
      { property: "og:title", content: "Akun Calon Santri — PPDB Bina Insani" },
      { property: "og:description", content: "Kelola pendaftaran santri baru Bina Insani." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AkunLayout,
});

const tabs = [
  { to: "/akun", label: "Status", exact: true },
  { to: "/akun/formulir", label: "Formulir", exact: false },
  { to: "/akun/berkas", label: "Berkas", exact: false },
] as const;

function AkunLayout() {
  const { user } = Route.useRouteContext();
  const { data: profil } = useQuery(profilQuery(user.id));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function keluar() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/masuk", replace: true });
  }

  return (
    <div>
      <div className="border-b border-border print:hidden">
        <div className="container-page pt-10 md:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted-foreground">Akun calon santri</p>
              <p className="mt-3 font-display-tight text-4xl md:text-5xl">
                {profil?.nama ? <>Assalamu’alaikum, {profil.nama.split(" ")[0]}.</> : "Assalamu’alaikum."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
            </div>
            <button type="button" onClick={keluar} className="inline-flex items-center gap-2 text-sm link-quiet">
              <LogOut className="size-4" /> Keluar
            </button>
          </div>
          <nav className="mt-10 -mb-px flex gap-8" aria-label="Akun">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.exact }}
                className="border-b-2 border-transparent pb-3 text-[0.95rem] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!border-primary !text-foreground" }}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
