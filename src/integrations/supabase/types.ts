export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      berkas_pendaftaran: {
        Row: {
          created_at: string
          id: string
          kode: string
          mime_type: string
          nama_file: string
          pendaftaran_id: string
          storage_path: string
          ukuran: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          mime_type?: string
          nama_file: string
          pendaftaran_id: string
          storage_path: string
          ukuran?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          mime_type?: string
          nama_file?: string
          pendaftaran_id?: string
          storage_path?: string
          ukuran?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "berkas_pendaftaran_kode_fkey"
            columns: ["kode"]
            isOneToOne: false
            referencedRelation: "jenis_berkas"
            referencedColumns: ["kode"]
          },
          {
            foreignKeyName: "berkas_pendaftaran_pendaftaran_id_fkey"
            columns: ["pendaftaran_id"]
            isOneToOne: false
            referencedRelation: "pendaftaran"
            referencedColumns: ["id"]
          },
        ]
      }
      gelombang: {
        Row: {
          created_at: string
          dipublikasikan: boolean
          id: string
          kuota: number
          mulai: string
          nama: string
          selesai: string
          tahun_ajaran: string
          tanggal_pengumuman: string | null
          tanggal_seleksi: string | null
          urutan: number
        }
        Insert: {
          created_at?: string
          dipublikasikan?: boolean
          id?: string
          kuota: number
          mulai: string
          nama: string
          selesai: string
          tahun_ajaran: string
          tanggal_pengumuman?: string | null
          tanggal_seleksi?: string | null
          urutan: number
        }
        Update: {
          created_at?: string
          dipublikasikan?: boolean
          id?: string
          kuota?: number
          mulai?: string
          nama?: string
          selesai?: string
          tahun_ajaran?: string
          tanggal_pengumuman?: string | null
          tanggal_seleksi?: string | null
          urutan?: number
        }
        Relationships: []
      }
      jenis_berkas: {
        Row: {
          aktif: boolean
          keterangan: string | null
          kode: string
          maks_bytes: number
          mime_types: string[]
          nama: string
          urutan: number
          wajib: boolean
        }
        Insert: {
          aktif?: boolean
          keterangan?: string | null
          kode: string
          maks_bytes: number
          mime_types: string[]
          nama: string
          urutan?: number
          wajib?: boolean
        }
        Update: {
          aktif?: boolean
          keterangan?: string | null
          kode?: string
          maks_bytes?: number
          mime_types?: string[]
          nama?: string
          urutan?: number
          wajib?: boolean
        }
        Relationships: []
      }
      pendaftaran: {
        Row: {
          alamat: string | null
          catatan_panitia: string | null
          created_at: string
          diajukan_at: string | null
          gelombang_id: string
          id: string
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin"] | null
          kampus: string | null
          nama_lengkap: string | null
          nik: string | null
          nim: string | null
          nomor_pendaftaran: string | null
          prodi: string | null
          semester: number | null
          status: Database["public"]["Enums"]["status_pendaftaran"]
          tahun_ajaran: string
          tanggal_lahir: string | null
          tempat_lahir: string | null
          updated_at: string
          user_id: string
          wali_alamat: string | null
          wali_hubungan: string | null
          wali_nama: string | null
          wali_telepon: string | null
        }
        Insert: {
          alamat?: string | null
          catatan_panitia?: string | null
          created_at?: string
          diajukan_at?: string | null
          gelombang_id: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"] | null
          kampus?: string | null
          nama_lengkap?: string | null
          nik?: string | null
          nim?: string | null
          nomor_pendaftaran?: string | null
          prodi?: string | null
          semester?: number | null
          status?: Database["public"]["Enums"]["status_pendaftaran"]
          tahun_ajaran: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id: string
          wali_alamat?: string | null
          wali_hubungan?: string | null
          wali_nama?: string | null
          wali_telepon?: string | null
        }
        Update: {
          alamat?: string | null
          catatan_panitia?: string | null
          created_at?: string
          diajukan_at?: string | null
          gelombang_id?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"] | null
          kampus?: string | null
          nama_lengkap?: string | null
          nik?: string | null
          nim?: string | null
          nomor_pendaftaran?: string | null
          prodi?: string | null
          semester?: number | null
          status?: Database["public"]["Enums"]["status_pendaftaran"]
          tahun_ajaran?: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id?: string
          wali_alamat?: string | null
          wali_hubungan?: string | null
          wali_nama?: string | null
          wali_telepon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pendaftaran_gelombang_id_fkey"
            columns: ["gelombang_id"]
            isOneToOne: false
            referencedRelation: "gelombang"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nama: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          nama?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nama?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ajukan_pendaftaran: {
        Args: { _id: string }
        Returns: {
          alamat: string | null
          catatan_panitia: string | null
          created_at: string
          diajukan_at: string | null
          gelombang_id: string
          id: string
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin"] | null
          kampus: string | null
          nama_lengkap: string | null
          nik: string | null
          nim: string | null
          nomor_pendaftaran: string | null
          prodi: string | null
          semester: number | null
          status: Database["public"]["Enums"]["status_pendaftaran"]
          tahun_ajaran: string
          tanggal_lahir: string | null
          tempat_lahir: string | null
          updated_at: string
          user_id: string
          wali_alamat: string | null
          wali_hubungan: string | null
          wali_nama: string | null
          wali_telepon: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pendaftaran"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gelombang_dibuka: { Args: { _id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      pendaftaran_validasi_format: {
        Args: { p: Database["public"]["Tables"]["pendaftaran"]["Row"] }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "calon_santri" | "panitia" | "pimpinan" | "super_admin"
      jenis_kelamin: "L" | "P"
      status_pendaftaran:
        | "draf"
        | "menunggu_verifikasi"
        | "perlu_perbaikan"
        | "terverifikasi"
        | "diterima"
        | "cadangan"
        | "tidak_diterima"
        | "terdaftar_ulang"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["calon_santri", "panitia", "pimpinan", "super_admin"],
      jenis_kelamin: ["L", "P"],
      status_pendaftaran: [
        "draf",
        "menunggu_verifikasi",
        "perlu_perbaikan",
        "terverifikasi",
        "diterima",
        "cadangan",
        "tidak_diterima",
        "terdaftar_ulang",
      ],
    },
  },
} as const
