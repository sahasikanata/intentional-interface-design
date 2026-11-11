export type GelombangStatus = "Dibuka" | "Belum Dibuka" | "Ditutup";

export interface Gelombang {
  nama: string;
  /** ISO date, inclusive */
  mulai: string;
  /** ISO date, inclusive (until end of day, WIB) */
  selesai: string;
  kuota: number;
  seleksi: string;
  pengumuman: string;
}

/** Registration is only possible while a wave is open (PRD §8 rule 1). */
export function statusGelombang(g: Gelombang, now: Date = new Date()): GelombangStatus {
  const start = new Date(`${g.mulai}T00:00:00+07:00`);
  const end = new Date(`${g.selesai}T23:59:59+07:00`);
  if (now < start) return "Belum Dibuka";
  if (now > end) return "Ditutup";
  return "Dibuka";
}

const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const bulanPanjang = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function tanggalPendek(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${bulan[m - 1]} ${y}`;
}

export function tanggalPanjang(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${bulanPanjang[m - 1]} ${y}`;
}

export function rupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
