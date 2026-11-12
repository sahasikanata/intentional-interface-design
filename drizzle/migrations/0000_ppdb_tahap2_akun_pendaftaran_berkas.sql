
-- ========== Enums ==========
CREATE TYPE public.app_role AS ENUM ('calon_santri', 'panitia', 'pimpinan', 'super_admin');
CREATE TYPE public.status_pendaftaran AS ENUM (
  'draf', 'menunggu_verifikasi', 'perlu_perbaikan', 'terverifikasi',
  'diterima', 'cadangan', 'tidak_diterima', 'terdaftar_ulang'
);
CREATE TYPE public.jenis_kelamin AS ENUM ('L', 'P');

-- ========== Generic updated_at ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ========== Profiles ==========
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========== Roles ==========
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('panitia', 'pimpinan', 'super_admin')
  )
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Own profile or staff can read" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.profiles_before_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.email := OLD.email;
  NEW.created_at := OLD.created_at;
  NEW.nama := btrim(NEW.nama);
  NEW.whatsapp := btrim(NEW.whatsapp);
  IF length(NEW.nama) < 3 OR length(NEW.nama) > 100 THEN
    RAISE EXCEPTION 'Nama harus 3–100 karakter.';
  END IF;
  IF NEW.whatsapp !~ '^628[0-9]{7,12}$' THEN
    RAISE EXCEPTION 'Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_before_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_before_update();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, whatsapp)
  VALUES (
    NEW.id,
    left(btrim(coalesce(NEW.raw_user_meta_data ->> 'nama', '')), 100),
    coalesce(NEW.email, ''),
    left(btrim(coalesce(NEW.raw_user_meta_data ->> 'whatsapp', '')), 20)
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'calon_santri')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== Gelombang ==========
CREATE TABLE public.gelombang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun_ajaran text NOT NULL,
  urutan smallint NOT NULL,
  nama text NOT NULL,
  mulai date NOT NULL,
  selesai date NOT NULL,
  kuota integer NOT NULL CHECK (kuota > 0),
  tanggal_seleksi date,
  tanggal_pengumuman date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tahun_ajaran, urutan),
  CHECK (selesai >= mulai)
);
GRANT SELECT ON public.gelombang TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gelombang TO authenticated;
GRANT ALL ON public.gelombang TO service_role;
ALTER TABLE public.gelombang ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read gelombang" ON public.gelombang
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Panitia manage gelombang" ON public.gelombang
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.gelombang_dibuka(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gelombang
    WHERE id = _id AND (now() AT TIME ZONE 'Asia/Jakarta')::date BETWEEN mulai AND selesai
  )
$$;

INSERT INTO public.gelombang (tahun_ajaran, urutan, nama, mulai, selesai, kuota, tanggal_seleksi, tanggal_pengumuman) VALUES
  ('2027/2028', 1, 'Gelombang I',   '2026-11-01', '2026-12-31', 40, '2027-01-09', '2027-01-16'),
  ('2027/2028', 2, 'Gelombang II',  '2027-01-18', '2027-03-14', 35, '2027-03-20', '2027-03-27'),
  ('2027/2028', 3, 'Gelombang III', '2027-04-05', '2027-06-13', 25, '2027-06-19', '2027-06-26');

-- ========== Jenis berkas (master) ==========
CREATE TABLE public.jenis_berkas (
  kode text PRIMARY KEY,
  nama text NOT NULL,
  keterangan text,
  mime_types text[] NOT NULL,
  maks_bytes integer NOT NULL CHECK (maks_bytes > 0),
  wajib boolean NOT NULL DEFAULT true,
  urutan smallint NOT NULL DEFAULT 0
);
GRANT SELECT ON public.jenis_berkas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jenis_berkas TO authenticated;
GRANT ALL ON public.jenis_berkas TO service_role;
ALTER TABLE public.jenis_berkas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read jenis_berkas" ON public.jenis_berkas
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Panitia manage jenis_berkas" ON public.jenis_berkas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.jenis_berkas (kode, nama, keterangan, mime_types, maks_bytes, wajib, urutan) VALUES
  ('ktp', 'Kartu Tanda Penduduk (KTP)', NULL, ARRAY['application/pdf','image/jpeg'], 2097152, true, 1),
  ('ktm', 'Kartu Tanda Mahasiswa atau surat keterangan aktif kuliah', NULL, ARRAY['application/pdf','image/jpeg'], 2097152, true, 2),
  ('foto', 'Pas foto 3×4', 'Latar polos, berpakaian rapi', ARRAY['image/jpeg','image/png'], 1048576, true, 3),
  ('kk', 'Kartu Keluarga', NULL, ARRAY['application/pdf','image/jpeg'], 2097152, true, 4),
  ('sertifikat', 'Sertifikat tahfidz atau prestasi', NULL, ARRAY['application/pdf'], 2097152, false, 5);

-- ========== Pendaftaran ==========
CREATE TABLE public.pendaftaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gelombang_id uuid NOT NULL REFERENCES public.gelombang(id),
  tahun_ajaran text NOT NULL,
  nomor_pendaftaran text UNIQUE,
  status public.status_pendaftaran NOT NULL DEFAULT 'draf',
  catatan_panitia text,
  nama_lengkap text,
  nik text,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin public.jenis_kelamin,
  alamat text,
  kampus text,
  prodi text,
  semester smallint,
  nim text,
  wali_nama text,
  wali_hubungan text,
  wali_telepon text,
  wali_alamat text,
  diajukan_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tahun_ajaran)
);
CREATE INDEX pendaftaran_gelombang_idx ON public.pendaftaran (gelombang_id);
GRANT SELECT, INSERT, UPDATE ON public.pendaftaran TO authenticated;
GRANT ALL ON public.pendaftaran TO service_role;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own or staff read pendaftaran" ON public.pendaftaran
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Users create own pendaftaran" ON public.pendaftaran
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users edit own editable pendaftaran" ON public.pendaftaran
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('draf', 'perlu_perbaikan'))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Panitia update pendaftaran" ON public.pendaftaran
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin'));

-- Field format checks shared by insert and update (only for filled values; drafts may be partial).
CREATE OR REPLACE FUNCTION public.pendaftaran_validasi_format(p public.pendaftaran)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF p.nik IS NOT NULL AND p.nik <> '' AND p.nik !~ '^[0-9]{16}$' THEN
    RAISE EXCEPTION 'NIK harus 16 digit angka.';
  END IF;
  IF p.semester IS NOT NULL AND (p.semester < 1 OR p.semester > 14) THEN
    RAISE EXCEPTION 'Semester harus antara 1 dan 14.';
  END IF;
  IF p.wali_telepon IS NOT NULL AND p.wali_telepon <> '' AND p.wali_telepon !~ '^62[0-9]{8,13}$' THEN
    RAISE EXCEPTION 'Nomor telepon wali tidak valid.';
  END IF;
  IF p.tanggal_lahir IS NOT NULL AND (p.tanggal_lahir > (now()::date - interval '15 years') OR p.tanggal_lahir < date '1960-01-01') THEN
    RAISE EXCEPTION 'Tanggal lahir tidak valid.';
  END IF;
  IF length(coalesce(p.nama_lengkap,'')) > 100 OR length(coalesce(p.tempat_lahir,'')) > 80
     OR length(coalesce(p.alamat,'')) > 300 OR length(coalesce(p.kampus,'')) > 120
     OR length(coalesce(p.prodi,'')) > 120 OR length(coalesce(p.nim,'')) > 30
     OR length(coalesce(p.wali_nama,'')) > 100 OR length(coalesce(p.wali_hubungan,'')) > 40
     OR length(coalesce(p.wali_alamat,'')) > 300 THEN
    RAISE EXCEPTION 'Ada isian yang terlalu panjang.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.pendaftaran_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.gelombang;
BEGIN
  SELECT * INTO g FROM public.gelombang WHERE id = NEW.gelombang_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Gelombang tidak ditemukan.'; END IF;
  IF NOT public.gelombang_dibuka(NEW.gelombang_id) THEN
    RAISE EXCEPTION 'Pendaftaran % sedang tidak dibuka.', g.nama;
  END IF;
  NEW.tahun_ajaran := g.tahun_ajaran;
  NEW.status := 'draf';
  NEW.nomor_pendaftaran := NULL;
  NEW.catatan_panitia := NULL;
  NEW.diajukan_at := NULL;
  NEW.created_at := now();
  NEW.updated_at := now();
  PERFORM public.pendaftaran_validasi_format(NEW);
  RETURN NEW;
END;
$$;
CREATE TRIGGER pendaftaran_before_insert BEFORE INSERT ON public.pendaftaran
  FOR EACH ROW EXECUTE FUNCTION public.pendaftaran_before_insert();

CREATE OR REPLACE FUNCTION public.pendaftaran_before_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.gelombang;
BEGIN
  NEW.updated_at := now();
  NEW.created_at := OLD.created_at;
  NEW.user_id := OLD.user_id;

  -- Internal transitions (ajukan_pendaftaran) and staff may change workflow columns.
  IF coalesce(current_setting('ppdb.internal', true), '') = 'on'
     OR public.has_role(auth.uid(), 'panitia') OR public.has_role(auth.uid(), 'super_admin') THEN
    PERFORM public.pendaftaran_validasi_format(NEW);
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.nomor_pendaftaran IS DISTINCT FROM OLD.nomor_pendaftaran
     OR NEW.catatan_panitia IS DISTINCT FROM OLD.catatan_panitia
     OR NEW.diajukan_at IS DISTINCT FROM OLD.diajukan_at THEN
    RAISE EXCEPTION 'Status pendaftaran hanya dapat diubah oleh panitia.';
  END IF;

  IF NEW.gelombang_id IS DISTINCT FROM OLD.gelombang_id THEN
    IF OLD.status <> 'draf' THEN
      RAISE EXCEPTION 'Gelombang tidak dapat diganti setelah pendaftaran diajukan.';
    END IF;
    SELECT * INTO g FROM public.gelombang WHERE id = NEW.gelombang_id;
    IF NOT FOUND OR NOT public.gelombang_dibuka(NEW.gelombang_id) THEN
      RAISE EXCEPTION 'Gelombang yang dipilih sedang tidak dibuka.';
    END IF;
    IF g.tahun_ajaran <> OLD.tahun_ajaran THEN
      RAISE EXCEPTION 'Gelombang harus pada tahun ajaran yang sama.';
    END IF;
  END IF;
  NEW.tahun_ajaran := OLD.tahun_ajaran;

  PERFORM public.pendaftaran_validasi_format(NEW);
  RETURN NEW;
END;
$$;
CREATE TRIGGER pendaftaran_before_update BEFORE UPDATE ON public.pendaftaran
  FOR EACH ROW EXECUTE FUNCTION public.pendaftaran_before_update();

-- ========== Berkas pendaftaran ==========
CREATE TABLE public.berkas_pendaftaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pendaftaran_id uuid NOT NULL REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
  kode text NOT NULL REFERENCES public.jenis_berkas(kode),
  storage_path text NOT NULL,
  nama_file text NOT NULL,
  ukuran integer NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pendaftaran_id, kode)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.berkas_pendaftaran TO authenticated;
GRANT ALL ON public.berkas_pendaftaran TO service_role;
ALTER TABLE public.berkas_pendaftaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own or staff read berkas" ON public.berkas_pendaftaran
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id
            AND (p.user_id = auth.uid() OR public.is_staff(auth.uid())))
  );
CREATE POLICY "Users add berkas while editable" ON public.berkas_pendaftaran
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id
            AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  );
CREATE POLICY "Users replace berkas while editable" ON public.berkas_pendaftaran
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id
            AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id
            AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  );
CREATE POLICY "Users remove berkas while editable" ON public.berkas_pendaftaran
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id
            AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  );

-- Server-side file validation: the stored object must exist in the owner's folder and
-- match the allowed type and size for its document kind. Size/type are taken from storage.
CREATE OR REPLACE FUNCTION public.berkas_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE
  j public.jenis_berkas;
  p public.pendaftaran;
  obj_size bigint;
  obj_mime text;
BEGIN
  SELECT * INTO j FROM public.jenis_berkas WHERE kode = NEW.kode;
  IF NOT FOUND THEN RAISE EXCEPTION 'Jenis berkas tidak dikenal.'; END IF;
  SELECT * INTO p FROM public.pendaftaran WHERE id = NEW.pendaftaran_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pendaftaran tidak ditemukan.'; END IF;

  IF NEW.storage_path NOT LIKE (p.user_id::text || '/' || p.id::text || '/%') THEN
    RAISE EXCEPTION 'Lokasi berkas tidak valid.';
  END IF;

  SELECT (o.metadata ->> 'size')::bigint, o.metadata ->> 'mimetype'
    INTO obj_size, obj_mime
  FROM storage.objects o
  WHERE o.bucket_id = 'berkas-pendaftaran' AND o.name = NEW.storage_path;
  IF NOT FOUND THEN RAISE EXCEPTION 'Berkas belum terunggah.'; END IF;

  IF obj_mime IS NULL OR NOT (obj_mime = ANY (j.mime_types)) THEN
    RAISE EXCEPTION 'Format berkas % tidak sesuai ketentuan.', j.nama;
  END IF;
  IF obj_size IS NULL OR obj_size > j.maks_bytes THEN
    RAISE EXCEPTION 'Ukuran berkas % melebihi batas.', j.nama;
  END IF;

  NEW.ukuran := obj_size;
  NEW.mime_type := obj_mime;
  NEW.nama_file := left(NEW.nama_file, 200);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER berkas_before_write BEFORE INSERT OR UPDATE ON public.berkas_pendaftaran
  FOR EACH ROW EXECUTE FUNCTION public.berkas_before_write();

-- ========== Submit RPC ==========
CREATE OR REPLACE FUNCTION public.ajukan_pendaftaran(_id uuid)
RETURNS public.pendaftaran LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.pendaftaran;
  g public.gelombang;
  kurang text[] := ARRAY[]::text[];
  berkas_kurang text;
  nomor text;
  n integer;
BEGIN
  SELECT * INTO p FROM public.pendaftaran WHERE id = _id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pendaftaran tidak ditemukan.'; END IF;
  IF p.status NOT IN ('draf', 'perlu_perbaikan') THEN
    RAISE EXCEPTION 'Pendaftaran ini sudah diajukan.';
  END IF;

  SELECT * INTO g FROM public.gelombang WHERE id = p.gelombang_id;
  IF p.status = 'draf' AND NOT public.gelombang_dibuka(p.gelombang_id) THEN
    RAISE EXCEPTION '% sudah ditutup.', g.nama;
  END IF;

  IF coalesce(btrim(p.nama_lengkap), '') = '' THEN kurang := kurang || 'nama lengkap'; END IF;
  IF coalesce(p.nik, '') = '' THEN kurang := kurang || 'NIK'; END IF;
  IF coalesce(btrim(p.tempat_lahir), '') = '' THEN kurang := kurang || 'tempat lahir'; END IF;
  IF p.tanggal_lahir IS NULL THEN kurang := kurang || 'tanggal lahir'; END IF;
  IF p.jenis_kelamin IS NULL THEN kurang := kurang || 'jenis kelamin'; END IF;
  IF coalesce(btrim(p.alamat), '') = '' THEN kurang := kurang || 'alamat'; END IF;
  IF coalesce(btrim(p.kampus), '') = '' THEN kurang := kurang || 'perguruan tinggi'; END IF;
  IF coalesce(btrim(p.prodi), '') = '' THEN kurang := kurang || 'program studi'; END IF;
  IF p.semester IS NULL THEN kurang := kurang || 'semester'; END IF;
  IF coalesce(btrim(p.nim), '') = '' THEN kurang := kurang || 'NIM'; END IF;
  IF coalesce(btrim(p.wali_nama), '') = '' THEN kurang := kurang || 'nama wali'; END IF;
  IF coalesce(btrim(p.wali_hubungan), '') = '' THEN kurang := kurang || 'hubungan wali'; END IF;
  IF coalesce(p.wali_telepon, '') = '' THEN kurang := kurang || 'telepon wali'; END IF;
  IF array_length(kurang, 1) > 0 THEN
    RAISE EXCEPTION 'Data belum lengkap: %.', array_to_string(kurang, ', ');
  END IF;

  SELECT string_agg(j.nama, ', ' ORDER BY j.urutan) INTO berkas_kurang
  FROM public.jenis_berkas j
  WHERE j.wajib AND NOT EXISTS (
    SELECT 1 FROM public.berkas_pendaftaran b WHERE b.pendaftaran_id = p.id AND b.kode = j.kode
  );
  IF berkas_kurang IS NOT NULL THEN
    RAISE EXCEPTION 'Berkas wajib belum diunggah: %.', berkas_kurang;
  END IF;

  nomor := p.nomor_pendaftaran;
  IF nomor IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext('nomor:' || p.gelombang_id::text));
    SELECT count(*) + 1 INTO n FROM public.pendaftaran
      WHERE gelombang_id = p.gelombang_id AND nomor_pendaftaran IS NOT NULL;
    nomor := format('BI-%s-%s-%s', left(g.tahun_ajaran, 4), g.urutan, lpad(n::text, 4, '0'));
  END IF;

  PERFORM set_config('ppdb.internal', 'on', true);
  UPDATE public.pendaftaran
     SET status = 'menunggu_verifikasi',
         nomor_pendaftaran = nomor,
         diajukan_at = now()
   WHERE id = p.id
   RETURNING * INTO p;
  PERFORM set_config('ppdb.internal', 'off', true);
  RETURN p;
END;
$$;
REVOKE ALL ON FUNCTION public.ajukan_pendaftaran(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ajukan_pendaftaran(uuid) TO authenticated;

-- ========== Storage policies (bucket berkas-pendaftaran) ==========
-- Path: <user_id>/<pendaftaran_id>/<file>
CREATE POLICY "Calon santri upload berkas sendiri" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'berkas-pendaftaran'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (SELECT 1 FROM public.pendaftaran p
                WHERE p.id::text = (storage.foldername(name))[2]
                  AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  );
CREATE POLICY "Calon santri hapus berkas sendiri" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'berkas-pendaftaran'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (SELECT 1 FROM public.pendaftaran p
                WHERE p.id::text = (storage.foldername(name))[2]
                  AND p.user_id = auth.uid() AND p.status IN ('draf', 'perlu_perbaikan'))
  );
CREATE POLICY "Pemilik atau staf lihat berkas" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'berkas-pendaftaran'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid()))
  );
