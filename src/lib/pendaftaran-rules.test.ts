import { describe, expect, it } from "vitest";
import { bisaDiubah, cekBerkas, daftarAkunSchema, formulirSchema, isianKurang, normalisasiNomorHp } from "./pendaftaran-rules";

describe("normalisasiNomorHp", () => {
  it("turns 08… into 628…", () => expect(normalisasiNomorHp("0812-3456-7890")).toBe("6281234567890"));
  it("accepts +62 prefix", () => expect(normalisasiNomorHp("+62 812 3456 7890")).toBe("6281234567890"));
  it("rejects non-mobile numbers", () => expect(normalisasiNomorHp("024 7654321")).toBeNull());
});

describe("daftarAkunSchema", () => {
  const ok = { nama: "Ahmad Fauzi", email: "a@b.id", whatsapp: "081234567890", password: "rahasia12", konfirmasi: "rahasia12" };
  it("accepts a valid account", () => expect(daftarAkunSchema.safeParse(ok).success).toBe(true));
  it("requires passwords of at least 8 characters", () =>
    expect(daftarAkunSchema.safeParse({ ...ok, password: "1234567", konfirmasi: "1234567" }).success).toBe(false));
  it("requires matching confirmation", () =>
    expect(daftarAkunSchema.safeParse({ ...ok, konfirmasi: "lain12345" }).success).toBe(false));
});

describe("formulirSchema", () => {
  const empty = Object.fromEntries(Object.keys(formulirSchema.shape).map((k) => [k, ""]));
  it("allows an empty draft", () => expect(formulirSchema.safeParse(empty).success).toBe(true));
  it("rejects a NIK that is not 16 digits", () =>
    expect(formulirSchema.safeParse({ ...empty, nik: "33740123" }).success).toBe(false));
  it("accepts a 16-digit NIK", () =>
    expect(formulirSchema.safeParse({ ...empty, nik: "3374012345678901" }).success).toBe(true));
  it("rejects semester above 14", () => expect(formulirSchema.safeParse({ ...empty, semester: "15" }).success).toBe(false));
});

describe("isianKurang", () => {
  it("lists all 13 required fields for an empty form", () => expect(isianKurang({}).length).toBe(13));
});

describe("bisaDiubah", () => {
  it("allows editing in draf and perlu_perbaikan only", () => {
    expect(bisaDiubah("draf")).toBe(true);
    expect(bisaDiubah("perlu_perbaikan")).toBe(true);
    expect(bisaDiubah("menunggu_verifikasi")).toBe(false);
    expect(bisaDiubah("terverifikasi")).toBe(false);
  });
});

describe("cekBerkas", () => {
  const foto = { mime_types: ["image/jpeg", "image/png"], maks_bytes: 1048576 };
  it("rejects a PDF for the photo", () => expect(cekBerkas({ type: "application/pdf", size: 1000 }, foto)).toBe("format"));
  it("rejects a photo over 1 MB", () => expect(cekBerkas({ type: "image/jpeg", size: 1048577 }, foto)).toBe("ukuran"));
  it("accepts a 1 MB JPG", () => expect(cekBerkas({ type: "image/jpeg", size: 1048576 }, foto)).toBeNull());
});
