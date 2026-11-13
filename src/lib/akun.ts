import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const BUCKET_BERKAS = "berkas-pendaftaran";

export type Pendaftaran = Database["public"]["Tables"]["pendaftaran"]["Row"];
export type Gelombang = Database["public"]["Tables"]["gelombang"]["Row"];
export type PendaftaranDenganGelombang = Pendaftaran & { gelombang: Gelombang | null };
export type BerkasRow = Database["public"]["Tables"]["berkas_pendaftaran"]["Row"];

export const profilQuery = (userId: string) =>
  queryOptions({
    queryKey: ["akun", userId, "profil"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, nama, email, whatsapp").eq("id", userId).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const pendaftaranQuery = (userId: string) =>
  queryOptions({
    queryKey: ["akun", userId, "pendaftaran"],
    queryFn: async (): Promise<PendaftaranDenganGelombang | null> => {
      const { data, error } = await supabase
        .from("pendaftaran")
        .select("*, gelombang(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as PendaftaranDenganGelombang | null;
    },
  });

export const berkasQuery = (pendaftaranId: string | undefined) =>
  queryOptions({
    queryKey: ["akun", "berkas", pendaftaranId ?? "none"],
    enabled: !!pendaftaranId,
    queryFn: async () => {
      if (!pendaftaranId) return [] as BerkasRow[];
      const { data, error } = await supabase.from("berkas_pendaftaran").select("*").eq("pendaftaran_id", pendaftaranId);
      if (error) throw new Error(error.message);
      return data;
    },
  });

/** Postgres RAISE messages are already written for applicants; strip technical prefixes. */
export function pesanError(e: unknown) {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  if (!msg) return "Terjadi kesalahan. Coba lagi.";
  if (/duplicate key.*user_id.*tahun_ajaran|pendaftaran_user_id_tahun_ajaran_key/i.test(msg))
    return "Anda sudah memiliki pendaftaran pada tahun ajaran ini.";
  if (/row-level security|permission denied/i.test(msg)) return "Data ini tidak dapat diubah lagi.";
  if (/failed to fetch|network/i.test(msg)) return "Koneksi terputus. Periksa internet Anda lalu coba lagi.";
  return msg;
}
