import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public, read-only data (waves and document requirements) for SSR pages.
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listGelombang = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("gelombang")
    .select("id, tahun_ajaran, urutan, nama, mulai, selesai, kuota, tanggal_seleksi, tanggal_pengumuman")
    .order("tahun_ajaran")
    .order("urutan");
  if (error) throw new Error(error.message);
  return data;
});

export const listJenisBerkas = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("jenis_berkas")
    .select("kode, nama, keterangan, mime_types, maks_bytes, wajib, urutan")
    .order("urutan");
  if (error) throw new Error(error.message);
  return data;
});
