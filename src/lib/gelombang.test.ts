import { describe, expect, it } from "vitest";
import { statusGelombang, rupiah, type Gelombang } from "./gelombang";

const g: Gelombang = {
  nama: "I",
  mulai: "2026-11-01",
  selesai: "2026-12-31",
  kuota: 40,
  seleksi: "",
  pengumuman: "",
};

describe("statusGelombang", () => {
  it("is Belum Dibuka before the start date (WIB)", () => {
    expect(statusGelombang(g, new Date("2026-10-31T16:59:00Z"))).toBe("Belum Dibuka");
  });
  it("is Dibuka from 00:00 WIB on the start date", () => {
    expect(statusGelombang(g, new Date("2026-10-31T17:00:00Z"))).toBe("Dibuka");
  });
  it("is still Dibuka on the last day until 23:59 WIB", () => {
    expect(statusGelombang(g, new Date("2026-12-31T16:59:00Z"))).toBe("Dibuka");
  });
  it("is Ditutup after the last day", () => {
    expect(statusGelombang(g, new Date("2026-12-31T17:00:00Z"))).toBe("Ditutup");
  });
});

describe("rupiah", () => {
  it("formats with Indonesian thousand separators", () => {
    expect(rupiah(1500000)).toBe("Rp1.500.000");
  });
});
