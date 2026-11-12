import { queryOptions } from "@tanstack/react-query";
import { listGelombang, listJenisBerkas } from "./ppdb-public.functions";
import type { Gelombang } from "./gelombang";

export type GelombangRow = Awaited<ReturnType<typeof listGelombang>>[number];
export type JenisBerkasRow = Awaited<ReturnType<typeof listJenisBerkas>>[number];

export const gelombangQuery = queryOptions({
  queryKey: ["public", "gelombang"],
  queryFn: () => listGelombang(),
  staleTime: 5 * 60_000,
});

export const jenisBerkasQuery = queryOptions({
  queryKey: ["public", "jenis_berkas"],
  queryFn: () => listJenisBerkas(),
  staleTime: 5 * 60_000,
});

export function toGelombang(r: GelombangRow): Gelombang & { id: string; tahunAjaran: string } {
  return {
    id: r.id,
    tahunAjaran: r.tahun_ajaran,
    nama: r.nama,
    mulai: r.mulai,
    selesai: r.selesai,
    kuota: r.kuota,
    seleksi: r.tanggal_seleksi ?? "",
    pengumuman: r.tanggal_pengumuman ?? "",
  };
}

const mimeLabel: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};

export function formatMime(types: string[]) {
  return types.map((t) => mimeLabel[t] ?? t).join(" / ");
}

export function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${+(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}
