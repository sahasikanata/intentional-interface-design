import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageIntro, Ledger } from "@/components/site/PageIntro";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dataFormulir } from "@/data/ppdb";
import { formatBytes, formatMime, jenisBerkasQuery } from "@/lib/ppdb-queries";

export const Route = createFileRoute("/persyaratan")({
  head: () => ({
    meta: [
      { title: "Persyaratan Pendaftaran — Bina Insani Semarang" },
      { name: "description", content: "Berkas yang perlu diunggah, format dan ukuran file, serta data yang perlu disiapkan sebelum mendaftar." },
      { property: "og:title", content: "Persyaratan Pendaftaran — Bina Insani Semarang" },
      { property: "og:description", content: "KTP, KTM, pas foto, dan kartu keluarga — siapkan dalam PDF/JPG maksimal 2 MB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jenisBerkasQuery),
  component: Persyaratan,
});

function Persyaratan() {
  const { data: berkas } = useSuspenseQuery(jenisBerkasQuery);
  return (
    <>
      <PageIntro
        nomor="03"
        label="Persyaratan"
        title="Siapkan ini dulu, mendaftarnya cukup lima belas menit."
        lead="Berkas yang tidak sesuai format atau terlalu besar akan langsung ditolak sistem, jadi periksa daftar di bawah sebelum mulai."
      />

      <div className="space-y-24">
        <Ledger label="Berkas yang diunggah" title="Dokumen persyaratan.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-foreground/80 eyebrow text-muted-foreground">
                  <th className="py-3 pr-4 font-normal">Dokumen</th>
                  <th className="py-3 pr-4 font-normal">Format</th>
                  <th className="py-3 pr-4 font-normal">Maks.</th>
                  <th className="py-3 text-right font-normal">Sifat</th>
                </tr>
              </thead>
              <tbody>
                {berkas.map((b) => (
                  <tr key={b.kode} className="border-b border-border">
                    <td className="py-5 pr-4 text-lg leading-snug">
                      {b.nama}
                      {b.keterangan ? <span className="block text-sm text-muted-foreground">{b.keterangan}</span> : null}
                    </td>
                    <td className="py-5 pr-4 font-mono text-sm">{formatMime(b.mime_types)}</td>
                    <td className="py-5 pr-4 font-mono text-sm">{formatBytes(b.maks_bytes)}</td>
                    <td className="py-5 text-right eyebrow">
                      {b.wajib ? <span className="text-primary">Wajib</span> : <span className="text-muted-foreground">Opsional</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ledger>

        <Ledger label="Isian formulir" title="Data yang perlu Anda ketahui.">
          <div className="grid gap-10 sm:grid-cols-3">
            {dataFormulir.map((g) => (
              <div key={g.grup}>
                <h3 className="border-b border-foreground/80 pb-3 text-2xl">{g.grup}</h3>
                <ul className="mt-4 space-y-3">
                  {g.isi.map((x) => (
                    <li key={x} className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-primary" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Ledger>

        <Ledger label="Ketentuan" title="Yang sering terlewat.">
          <ul className="space-y-5 text-lg leading-relaxed">
            <li>Gunakan email dan nomor WhatsApp yang aktif — semua pemberitahuan dikirim ke sana.</li>
            <li>Satu calon santri hanya boleh memiliki satu pendaftaran aktif dalam satu tahun ajaran.</li>
            <li>Pendaftaran dianggap lengkap bila seluruh data wajib terisi dan seluruh berkas wajib terunggah.</li>
            <li>Berkas masih bisa diganti selama belum terverifikasi, atau saat panitia meminta perbaikan.</li>
          </ul>
        </Ledger>
      </div>
    </>
  );
}
