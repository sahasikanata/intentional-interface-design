import type { Gelombang } from "@/lib/gelombang";

// NOTE: Semua tanggal, biaya, kontak dan berita di bawah ini adalah contoh
// dan perlu diganti dengan data resmi dari panitia.

export const TAHUN_AJARAN = "2027/2028";

export const kontak = {
  alamat: "Jl. Bina Insani No. 12, Tembalang, Kota Semarang, Jawa Tengah 50275",
  email: "ppdb@binainsani-semarang.sch.id",
  jamLayanan: "Senin–Sabtu, 08.00–15.00 WIB",
  panitia: [
    { nama: "Ust. Ahmad Fauzi", peran: "Sekretariat PPDB (putra)", wa: "6281200000001", tampil: "0812-0000-0001" },
    { nama: "Ustz. Nur Azizah", peran: "Sekretariat PPDB (putri)", wa: "6281200000002", tampil: "0812-0000-0002" },
  ],
};

export const waLink = (nomor: string, pesan = "Assalamu'alaikum, saya ingin bertanya tentang PPDB Bina Insani.") =>
  `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

export const gelombang: Gelombang[] = [
  { nama: "Gelombang I", mulai: "2026-11-01", selesai: "2026-12-31", kuota: 40, seleksi: "2027-01-09", pengumuman: "2027-01-16" },
  { nama: "Gelombang II", mulai: "2027-01-18", selesai: "2027-03-14", kuota: 35, seleksi: "2027-03-20", pengumuman: "2027-03-27" },
  { nama: "Gelombang III", mulai: "2027-04-05", selesai: "2027-06-13", kuota: 25, seleksi: "2027-06-19", pengumuman: "2027-06-26" },
];

export const alur = [
  { judul: "Buat akun", isi: "Isi nama, email aktif, dan nomor WhatsApp. Satu akun untuk satu calon santri." },
  { judul: "Isi formulir", isi: "Pilih gelombang yang sedang dibuka, lalu lengkapi biodata, data kampus, dan kontak orang tua atau wali. Formulir bisa disimpan sebagai draf." },
  { judul: "Unggah berkas", isi: "KTP, KTM atau surat aktif kuliah, pas foto, dan kartu keluarga. Sistem langsung menolak berkas yang format atau ukurannya tidak sesuai." },
  { judul: "Verifikasi panitia", isi: "Panitia memeriksa data dan berkas. Hasilnya Terverifikasi, atau Perlu Perbaikan beserta catatan yang bisa Anda tindak lanjuti." },
  { judul: "Ikut seleksi", isi: "Hanya pendaftar terverifikasi yang mendapat jadwal. Seleksi bisa daring atau tatap muka, lengkap dengan kartu peserta." },
  { judul: "Pengumuman", isi: "Hasil disahkan pimpinan lalu diumumkan: Diterima, Cadangan, atau Tidak Diterima. Hasil tidak bisa dilihat sebelum diumumkan." },
  { judul: "Daftar ulang", isi: "Calon santri yang diterima mengonfirmasi kesediaan, membayar biaya daftar ulang secara daring, dan mengunggah berkas tambahan." },
  { judul: "Terdaftar ulang", isi: "Setelah pembayaran lunas dan berkas daftar ulang divalidasi, status Anda menjadi Terdaftar Ulang. Selamat datang di pondok." },
];

export const komponenSeleksi = [
  { nama: "Tes membaca Al-Qur'an", bobot: 40, ket: "Tajwid, makharijul huruf, dan kelancaran." },
  { nama: "Tes tertulis", bobot: 30, ket: "Pengetahuan dasar keislaman dan bahasa Arab." },
  { nama: "Wawancara", bobot: 30, ket: "Motivasi mondok, kesiapan membagi waktu kuliah, dan dukungan keluarga." },
];

export const berkas = [
  { nama: "Kartu Tanda Penduduk (KTP)", format: "PDF / JPG", maks: "2 MB", wajib: true },
  { nama: "Kartu Tanda Mahasiswa atau surat keterangan aktif kuliah", format: "PDF / JPG", maks: "2 MB", wajib: true },
  { nama: "Pas foto 3×4, latar polos, berpakaian rapi", format: "JPG / PNG", maks: "1 MB", wajib: true },
  { nama: "Kartu Keluarga", format: "PDF / JPG", maks: "2 MB", wajib: true },
  { nama: "Sertifikat tahfidz atau prestasi", format: "PDF", maks: "2 MB", wajib: false },
];

export const dataFormulir = [
  { grup: "Biodata", isi: ["Nama lengkap", "NIK", "Tempat & tanggal lahir", "Jenis kelamin", "Alamat sesuai KTP"] },
  { grup: "Perguruan tinggi", isi: ["Nama kampus", "Program studi", "Semester", "NIM"] },
  { grup: "Orang tua / wali", isi: ["Nama", "Hubungan", "Nomor telepon", "Alamat"] },
];

export const biayaDaftarUlang = [
  { item: "Uang pangkal (sekali bayar)", jumlah: 1_500_000 },
  { item: "Syahriah bulan pertama", jumlah: 450_000 },
  { item: "Kitab & modul diniyah semester ganjil", jumlah: 300_000 },
  { item: "Kasur, lemari, dan perlengkapan kamar", jumlah: 250_000 },
];

export const statusPembayaran = [
  { nama: "Menunggu Pembayaran", ket: "Tagihan sudah dibuat dan belum dibayar." },
  { nama: "Lunas", ket: "Pembayaran diterima dan terkonfirmasi otomatis." },
  { nama: "Gagal", ket: "Transaksi tidak berhasil. Anda bisa membuat tagihan baru." },
  { nama: "Kedaluwarsa", ket: "Batas waktu tagihan terlewat sebelum dibayar." },
];

export const jadwalHarian = [
  { jam: "03.30", kegiatan: "Qiyamul lail" },
  { jam: "04.30", kegiatan: "Subuh berjamaah, lalu mengaji Al-Qur'an" },
  { jam: "05.30", kegiatan: "Kajian kitab pagi" },
  { jam: "07.00", kegiatan: "Berangkat kuliah" },
  { jam: "18.00", kegiatan: "Maghrib berjamaah & tadarus" },
  { jam: "19.30", kegiatan: "Madrasah diniyah" },
  { jam: "21.30", kegiatan: "Belajar mandiri" },
  { jam: "22.30", kegiatan: "Istirahat" },
];

export interface Berita {
  slug: string;
  tanggal: string;
  kategori: "Pengumuman" | "Berita" | "Panduan";
  judul: string;
  ringkas: string;
  isi: string[];
}

export const berita: Berita[] = [
  {
    slug: "pendaftaran-gelombang-1-dibuka",
    tanggal: "2026-11-01",
    kategori: "Pengumuman",
    judul: "Pendaftaran Gelombang I Tahun Ajaran 2027/2028 resmi dibuka",
    ringkas: "Kuota 40 santri. Pendaftaran, unggah berkas, dan seleksi tidak dipungut biaya.",
    isi: [
      "Pondok Pesantren Bina Insani Semarang membuka Penerimaan Santri Baru Gelombang I untuk tahun ajaran 2027/2028 mulai 1 November hingga 31 Desember 2026.",
      "Pendaftaran terbuka bagi mahasiswa aktif dari perguruan tinggi mana pun di Semarang. Seluruh tahapan, mulai dari pembuatan akun hingga seleksi, tidak dipungut biaya.",
      "Biaya hanya dibayarkan oleh calon santri yang dinyatakan diterima, pada tahap daftar ulang, melalui pembayaran daring.",
    ],
  },
  {
    slug: "panduan-unggah-berkas",
    tanggal: "2026-11-04",
    kategori: "Panduan",
    judul: "Supaya berkas tidak ditolak: ukuran, format, dan cara memindai",
    ringkas: "Gunakan PDF atau JPG di bawah 2 MB. Pastikan seluruh tepi dokumen terlihat dan tulisan terbaca.",
    isi: [
      "Sebagian besar permintaan perbaikan terjadi karena foto dokumen terpotong atau buram. Letakkan dokumen di permukaan polos dengan cahaya cukup, lalu foto tegak lurus.",
      "Gunakan format PDF atau JPG dengan ukuran maksimal 2 MB, dan 1 MB untuk pas foto. Sistem akan menolak berkas di luar ketentuan ini secara otomatis.",
      "Jika diminta perbaikan, baca catatan panitia di halaman status, ganti berkasnya, lalu kirim ulang.",
    ],
  },
  {
    slug: "jadwal-seleksi-gelombang-1",
    tanggal: "2026-11-10",
    kategori: "Berita",
    judul: "Seleksi Gelombang I digelar 9 Januari 2027, daring dan tatap muka",
    ringkas: "Tes baca Al-Qur'an dan wawancara dapat diikuti di pondok atau melalui tautan pertemuan daring.",
    isi: [
      "Seleksi Gelombang I akan dilaksanakan pada Sabtu, 9 Januari 2027. Calon santri yang telah terverifikasi akan menerima jadwal dan kartu peserta melalui akun masing-masing.",
      "Tes tatap muka berlangsung di aula pondok. Bagi yang berhalangan hadir, panitia menyediakan sesi daring dengan tautan pertemuan yang tercantum di jadwal.",
    ],
  },
];
