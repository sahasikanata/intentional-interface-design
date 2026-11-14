import { z } from "zod";

export type StatusPendaftaran =
  | "draf"
  | "menunggu_verifikasi"
  | "perlu_perbaikan"
  | "terverifikasi"
  | "diterima"
  | "cadangan"
  | "tidak_diterima"
  | "terdaftar_ulang";

export const statusLabel: Record<StatusPendaftaran, string> = {
  draf: "Draf",
  menunggu_verifikasi: "Menunggu Verifikasi",
  perlu_perbaikan: "Perlu Perbaikan",
  terverifikasi: "Terverifikasi",
  diterima: "Diterima",
  cadangan: "Cadangan",
  tidak_diterima: "Tidak Diterima",
  terdaftar_ulang: "Terdaftar Ulang",
};

/** Applicants may edit data and files only while drafting or when asked to fix something. */
export function bisaDiubah(status: StatusPendaftaran) {
  return status === "draf" || status === "perlu_perbaikan";
}

/**
 * Normalises an Indonesian phone number to 62xxxxxxxxxx.
 * Accepts 08…, +628…, 628…, with spaces or dashes. Returns null when invalid.
 */
export function normalisasiNomorHp(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  let n = digits;
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!/^628[0-9]{7,12}$/.test(n)) return null;
  return n;
}

export function tampilNomorHp(n: string) {
  return n.startsWith("62") ? "0" + n.slice(2) : n;
}

const hp = z
  .string()
  .trim()
  .refine((v) => normalisasiNomorHp(v) !== null, "Nomor tidak valid. Contoh: 0812 3456 7890");

export const daftarAkunSchema = z
  .object({
    nama: z.string().trim().min(3, "Nama minimal 3 huruf").max(100, "Nama terlalu panjang"),
    email: z.string().trim().email("Format email tidak valid").max(255),
    whatsapp: hp,
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(72, "Kata sandi terlalu panjang"),
    konfirmasi: z.string(),
  })
  .refine((v) => v.password === v.konfirmasi, { path: ["konfirmasi"], message: "Kata sandi tidak sama" });

const opsional = (max: number) => z.string().trim().max(max, "Terlalu panjang");

/** Draft form: every field may be empty, but filled fields must be well-formed. */
export const formulirSchema = z.object({
  nama_lengkap: opsional(100),
  nik: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9]{16}$/.test(v), "NIK harus 16 digit angka"),
  tempat_lahir: opsional(80),
  tanggal_lahir: z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Tanggal tidak valid"),
  jenis_kelamin: z.enum(["", "L", "P"]),
  alamat: opsional(300),
  kampus: opsional(120),
  prodi: opsional(120),
  semester: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^[0-9]+$/.test(v) && +v >= 1 && +v <= 14), "Semester 1–14"),
  nim: opsional(30),
  wali_nama: opsional(100),
  wali_hubungan: opsional(40),
  wali_telepon: z
    .string()
    .trim()
    .refine((v) => v === "" || normalisasiNomorHp(v) !== null || /^0[0-9]{8,12}$/.test(v), "Nomor tidak valid"),
  wali_alamat: opsional(300),
});
export type FormulirValues = z.infer<typeof formulirSchema>;

/** Normalises a landline or mobile number to 62… form for storage. */
export function normalisasiTelepon(v: string): string | null {
  const d = v.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  const n = d.startsWith("0") ? "62" + d.slice(1) : d;
  return /^62[0-9]{8,13}$/.test(n) ? n : null;
}

export const isianWajib: { key: keyof FormulirValues; label: string }[] = [
  { key: "nama_lengkap", label: "Nama lengkap" },
  { key: "nik", label: "NIK" },
  { key: "tempat_lahir", label: "Tempat lahir" },
  { key: "tanggal_lahir", label: "Tanggal lahir" },
  { key: "jenis_kelamin", label: "Jenis kelamin" },
  { key: "alamat", label: "Alamat" },
  { key: "kampus", label: "Perguruan tinggi" },
  { key: "prodi", label: "Program studi" },
  { key: "semester", label: "Semester" },
  { key: "nim", label: "NIM" },
  { key: "wali_nama", label: "Nama wali" },
  { key: "wali_hubungan", label: "Hubungan wali" },
  { key: "wali_telepon", label: "Telepon wali" },
];

type IsianLike = Record<string, unknown>;

/** Required fields still empty — mirrors the server-side check in ajukan_pendaftaran. */
export function isianKurang(p: IsianLike) {
  return isianWajib.filter(({ key }) => {
    const v = p[key];
    return v === null || v === undefined || String(v).trim() === "";
  });
}

/** Validates a file against a document type's allowed formats and size before upload. */
export function cekBerkas(file: { type: string; size: number }, jenis: { mime_types: string[]; maks_bytes: number }) {
  if (!jenis.mime_types.includes(file.type)) return "format";
  if (file.size > jenis.maks_bytes) return "ukuran";
  return null;
}
