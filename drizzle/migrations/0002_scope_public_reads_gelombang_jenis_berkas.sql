-- Public reads of waves and document requirements are limited to published/active rows.
ALTER TABLE public.gelombang ADD COLUMN dipublikasikan boolean NOT NULL DEFAULT true;
ALTER TABLE public.jenis_berkas ADD COLUMN aktif boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Everyone can read gelombang" ON public.gelombang;
CREATE POLICY "Public read published gelombang" ON public.gelombang
  FOR SELECT TO anon, authenticated USING (dipublikasikan);
CREATE POLICY "Staff or own applicants read gelombang" ON public.gelombang
  FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.pendaftaran p
      WHERE p.gelombang_id = gelombang.id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Everyone can read jenis_berkas" ON public.jenis_berkas;
CREATE POLICY "Public read active jenis_berkas" ON public.jenis_berkas
  FOR SELECT TO anon, authenticated USING (aktif);
CREATE POLICY "Staff or own uploads read jenis_berkas" ON public.jenis_berkas
  FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.berkas_pendaftaran b
      JOIN public.pendaftaran p ON p.id = b.pendaftaran_id
      WHERE b.kode = jenis_berkas.kode AND p.user_id = auth.uid()
    )
  );

-- Unpublished waves never accept registrations.
CREATE OR REPLACE FUNCTION public.gelombang_dibuka(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gelombang
    WHERE id = _id AND dipublikasikan
      AND (now() AT TIME ZONE 'Asia/Jakarta')::date BETWEEN mulai AND selesai
  )
$$;

-- Inactive document kinds cannot receive new uploads.
CREATE OR REPLACE FUNCTION public.berkas_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE
  j public.jenis_berkas;
  p public.pendaftaran;
  obj_size bigint;
  obj_mime text;
BEGIN
  SELECT * INTO j FROM public.jenis_berkas WHERE kode = NEW.kode;
  IF NOT FOUND OR NOT j.aktif THEN RAISE EXCEPTION 'Jenis berkas tidak dikenal.'; END IF;
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

-- Only active required document kinds are checked on submission.
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

  IF coalesce(btrim(p.nama_lengkap), '') = '' THEN kurang := array_append(kurang, 'nama lengkap'); END IF;
  IF coalesce(p.nik, '') = '' THEN kurang := array_append(kurang, 'NIK'); END IF;
  IF coalesce(btrim(p.tempat_lahir), '') = '' THEN kurang := array_append(kurang, 'tempat lahir'); END IF;
  IF p.tanggal_lahir IS NULL THEN kurang := array_append(kurang, 'tanggal lahir'); END IF;
  IF p.jenis_kelamin IS NULL THEN kurang := array_append(kurang, 'jenis kelamin'); END IF;
  IF coalesce(btrim(p.alamat), '') = '' THEN kurang := array_append(kurang, 'alamat'); END IF;
  IF coalesce(btrim(p.kampus), '') = '' THEN kurang := array_append(kurang, 'perguruan tinggi'); END IF;
  IF coalesce(btrim(p.prodi), '') = '' THEN kurang := array_append(kurang, 'program studi'); END IF;
  IF p.semester IS NULL THEN kurang := array_append(kurang, 'semester'); END IF;
  IF coalesce(btrim(p.nim), '') = '' THEN kurang := array_append(kurang, 'NIM'); END IF;
  IF coalesce(btrim(p.wali_nama), '') = '' THEN kurang := array_append(kurang, 'nama wali'); END IF;
  IF coalesce(btrim(p.wali_hubungan), '') = '' THEN kurang := array_append(kurang, 'hubungan wali'); END IF;
  IF coalesce(p.wali_telepon, '') = '' THEN kurang := array_append(kurang, 'telepon wali'); END IF;
  IF coalesce(array_length(kurang, 1), 0) > 0 THEN
    RAISE EXCEPTION 'Data belum lengkap: %.', array_to_string(kurang, ', ');
  END IF;

  SELECT string_agg(j.nama, ', ' ORDER BY j.urutan) INTO berkas_kurang
  FROM public.jenis_berkas j
  WHERE j.wajib AND j.aktif AND NOT EXISTS (
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