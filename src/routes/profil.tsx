import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Ledger } from "@/components/site/PageIntro";
import { jadwalHarian } from "@/data/ppdb";
import sandal from "@/assets/sandal-serambi.jpg";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Pondok — Bina Insani Semarang" },
      { name: "description", content: "Mengenal Pondok Pesantren Mahasiswa Bina Insani Semarang: kegiatan, nilai, dan jadwal harian santri." },
      { property: "og:title", content: "Profil Pondok — Bina Insani Semarang" },
      { property: "og:description", content: "Pesantren mahasiswa di Tembalang: mengaji pagi dan malam, kuliah di siang hari." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profil,
});

function Profil() {
  return (
    <>
      <PageIntro
        nomor="01"
        label="Profil pondok"
        title={<>Rumah belajar bagi mahasiswa, <em className="font-light text-primary">sejak awal.</em></>}
        lead="Bina Insani berdiri untuk menjawab satu kebutuhan sederhana: mahasiswa yang merantau ke Semarang butuh tempat tinggal yang menjaga ibadah dan ilmu agamanya, tanpa mengorbankan kuliah."
      />

      <div className="container-page">
        <img
          src={sandal}
          alt="Deretan sandal di serambi masjid pondok"
          width={1200}
          height={912}
          loading="lazy"
          className="aspect-[21/9] w-full rounded-sm object-cover"
        />
      </div>

      <div className="mt-24 space-y-24">
        <Ledger label="Yang kami jaga" title="Tiga hal yang tidak ditawar.">
          <ol className="space-y-10">
            {[
              ["Ibadah berjamaah", "Subuh, maghrib, dan isya berjamaah di masjid pondok, setiap hari."],
              ["Ilmu yang bersanad", "Kajian kitab diampu asatidz yang belajar langsung dari pesantren salaf di Jawa."],
              ["Kuliah tetap utama", "Jadwal pondok disusun mengikuti jam kuliah. Santri didorong lulus tepat waktu."],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-3xl">{t}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Ledger>

        <Ledger label="Sehari di pondok" title="Jadwal harian santri.">
          <table className="w-full border-collapse">
            <tbody>
              {jadwalHarian.map((j) => (
                <tr key={j.jam} className="border-b border-border first:border-t">
                  <td className="w-28 py-4 align-baseline font-mono text-lg text-primary">{j.jam}</td>
                  <td className="py-4 align-baseline text-lg">{j.kegiatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-sm text-muted-foreground">
            Jadwal menyesuaikan kalender akademik kampus dan bulan Ramadan.
          </p>
        </Ledger>
      </div>
    </>
  );
}
