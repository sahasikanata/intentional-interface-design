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