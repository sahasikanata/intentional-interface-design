import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Eye, Lock, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/site/form";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_BERKAS, berkasQuery, pendaftaranQuery, pesanError, type BerkasRow } from "@/lib/akun";
import { formatBytes, formatMime, jenisBerkasQuery, type JenisBerkasRow } from "@/lib/ppdb-queries";
import { bisaDiubah, cekBerkas, type StatusPendaftaran } from "@/lib/pendaftaran-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/akun/berkas")({
  component: BerkasPage,
});

const ekstensi: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };

function BerkasPage() {
  const { user } = Route.useRouteContext();
  const p = useQuery(pendaftaranQuery(user.id));
  const jenis = useQuery(jenisBerkasQuery);
  const berkas = useQuery(berkasQuery(p.data?.id));

  if (p.isPending || jenis.isPending) return <div className="container-page py-20 eyebrow text-muted-foreground">Memuat…</div>;
  if (p.isError) return <div className="container-page py-16"><FormAlert>{pesanError(p.error)}</FormAlert></div>;
  if (!p.data)
    return (
      <div className="container-page py-16">
        <FormAlert tone="info">
          Pilih gelombang terlebih dahulu di{" "}
          <Link to="/akun" className="link-quiet">
            halaman status
          </Link>
          .
        </FormAlert>
      </div>
    );

  const editable = bisaDiubah(p.data.status as StatusPendaftaran);
  const rows = berkas.data ?? [];
  const wajib = (jenis.data ?? []).filter((j) => j.wajib);
  const wajibAda = wajib.filter((j) => rows.some((b) => b.kode === j.kode)).length;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow text-muted-foreground">Berkas persyaratan</p>
          <h1 className="mt-4 font-display-tight text-4xl md:text-5xl">Unggah dokumen Anda.</h1>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            Foto atau pindai dengan jelas, seluruh tepi dokumen terlihat. Berkas yang format atau ukurannya tidak sesuai
            akan langsung ditolak.
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <p className="font-display-tight text-5xl">
            {wajibAda}
            <span className="text-muted-foreground">/{wajib.length}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">berkas wajib terunggah</p>
        </div>
      </div>

      {!editable ? (
        <div className="mt-10">
          <FormAlert tone="info">
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4" /> Berkas terkunci karena pendaftaran sudah diajukan.
            </span>
          </FormAlert>
        </div>
      ) : null}

      <ul className="mt-12 border-t border-foreground/80">
        {(jenis.data ?? []).map((j) => (
          <BerkasItem
            key={j.kode}
            jenis={j}
            row={rows.find((b) => b.kode === j.kode)}
            userId={user.id}
            pendaftaranId={p.data!.id}
            editable={editable}
          />
        ))}
      </ul>

      {editable && wajibAda === wajib.length ? (
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Button asChild size="lg">
            <Link to="/akun">Periksa & ajukan pendaftaran</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BerkasItem({
  jenis,
  row,
  userId,
  pendaftaranId,
  editable,
}: {
  jenis: JenisBerkasRow;
  row: BerkasRow | undefined;
  userId: string;
  pendaftaranId: string;
  editable: boolean;
}) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "unggah" | "hapus">(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["akun", "berkas", pendaftaranId] });

  async function unggah(file: File) {
    setError(null);
    const salah = cekBerkas(file, jenis);
    if (salah === "format") { setError(`Format tidak sesuai. Gunakan ${formatMime(jenis.mime_types)}.`); return; }
    if (salah === "ukuran") { setError(`Ukuran ${formatBytes(file.size)} melebihi batas ${formatBytes(jenis.maks_bytes)}.`); return; }

    setBusy("unggah");
    const path = `${userId}/${pendaftaranId}/${jenis.kode}-${Date.now()}.${ekstensi[file.type] ?? "bin"}`;
    const up = await supabase.storage.from(BUCKET_BERKAS).upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      setBusy(null);
      { setError(pesanError(up.error)); return; }
    }
    const { error } = await supabase
      .from("berkas_pendaftaran")
      .upsert({ pendaftaran_id: pendaftaranId, kode: jenis.kode, storage_path: path, nama_file: file.name }, { onConflict: "pendaftaran_id,kode" });
    if (error) {
      await supabase.storage.from(BUCKET_BERKAS).remove([path]);
      setBusy(null);
      { setError(pesanError(error)); return; }
    }
    if (row && row.storage_path !== path) await supabase.storage.from(BUCKET_BERKAS).remove([row.storage_path]);
    await refresh();
    setBusy(null);
    toast.success(`${jenis.nama} terunggah.`);
  }

  async function hapus() {
    if (!row) return;
    setBusy("hapus");
    const { error } = await supabase.from("berkas_pendaftaran").delete().eq("id", row.id);
    if (error) {
      setBusy(null);
      { toast.error(pesanError(error)); return; }
    }
    await supabase.storage.from(BUCKET_BERKAS).remove([row.storage_path]);
    await refresh();
    setBusy(null);
  }

  async function lihat() {
    if (!row) return;
    const w = window.open("", "_blank");
    const { data, error } = await supabase.storage.from(BUCKET_BERKAS).createSignedUrl(row.storage_path, 120);
    if (error || !data) {
      w?.close();
      { toast.error("Berkas tidak dapat dibuka."); return; }
    }
    if (w) w.location.href = data.signedUrl;
  }

  return (
    <li className="grid gap-4 border-b border-border py-6 md:grid-cols-12 md:items-center">
      <div className="flex gap-4 md:col-span-6">
        <span
          className={cn(
            "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border",
            row ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
          )}
        >
          {row ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <div>
          <p className="text-lg leading-snug">
            {jenis.nama}
            <span className={cn("ml-3 eyebrow", jenis.wajib ? "text-primary" : "text-muted-foreground")}>
              {jenis.wajib ? "Wajib" : "Opsional"}
            </span>
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {formatMime(jenis.mime_types)} · maks. {formatBytes(jenis.maks_bytes)}
            {jenis.keterangan ? ` · ${jenis.keterangan}` : ""}
          </p>
        </div>
      </div>

      <div className="text-sm md:col-span-3">
        {row ? (
          <>
            <p className="truncate" title={row.nama_file}>
              {row.nama_file}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{formatBytes(row.ukuran)}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Belum diunggah</p>
        )}
        {error ? (
          <p role="alert" className="mt-1 text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:col-span-3 md:justify-end">
        {row ? (
          <Button type="button" variant="ghost" size="sm" onClick={lihat}>
            <Eye /> Lihat
          </Button>
        ) : null}
        {editable ? (
          <>
            {row ? (
              <Button type="button" variant="ghost" size="sm" onClick={hapus} disabled={!!busy} aria-label={`Hapus ${jenis.nama}`}>
                <Trash2 />
              </Button>
            ) : null}
            <Button type="button" variant={row ? "outline" : "default"} size="sm" disabled={!!busy} onClick={() => input.current?.click()}>
              <Upload /> {busy === "unggah" ? "Mengunggah…" : row ? "Ganti" : "Unggah"}
            </Button>
            <input
              ref={input}
              type="file"
              className="sr-only"
              aria-label={`Pilih berkas ${jenis.nama}`}
              accept={jenis.mime_types.join(",")}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void unggah(f);
              }}
            />
          </>
        ) : null}
      </div>
    </li>
  );
}
