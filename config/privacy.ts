import type { TermSection } from "@/config/terms";
import { SITE } from "@/config/site";

export const PRIVACY_POLICY: TermSection[] = [
  {
    id: "pengantar",
    title: "1. Pengantar",
    content: [
      `Kebijakan Privasi ini menjelaskan bagaimana ${SITE.name}, dioperasikan oleh ${SITE.operator}, mengumpulkan, menggunakan, dan melindungi data pribadi Pengguna (pemilik toko/penjahit) sesuai peraturan yang berlaku di Indonesia, termasuk UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
    ],
  },
  {
    id: "data_dikumpulkan",
    title: "2. Data yang Kami Kumpulkan",
    content: [
      "Data akun: nama dan alamat email dari akun Google yang kamu gunakan untuk masuk.",
      "Data toko: nama toko dan nomor WhatsApp bisnis yang kamu isi saat pendaftaran.",
      "Data operasional yang kamu input sendiri: nama dan nomor WhatsApp pelanggan, ukuran badan, detail pesanan, foto referensi, biaya, DP, dan deadline.",
      "Data transaksi langganan: nomor invoice, nominal, dan status pembayaran. Kami tidak menyimpan data kartu, rekening, atau e-wallet kamu karena pembayaran diproses melalui QRIS penyedia gerbang pembayaran.",
      "Data teknis seperti alamat IP, jenis perangkat, dan log akses, yang dipakai untuk keamanan dan mencegah penyalahgunaan.",
    ],
  },
  {
    id: "penggunaan",
    title: "3. Cara Kami Menggunakan Data",
    content: [
      "Menjalankan layanan: menyimpan pesanan, ukuran, dan riwayat pembayaran milikmu serta menampilkannya hanya kepada akunmu.",
      "Mengelola langganan, mengirim pengingat masa aktif, dan memberikan dukungan pelanggan.",
      "Menjaga keamanan sistem, termasuk mendeteksi akses mencurigakan. Tim admin menerima notifikasi internal (misalnya saat toko baru mendaftar atau pembayaran masuk) melalui kanal pesan internal.",
      "Kami tidak menjual data pribadi kamu maupun data pelangganmu, dan tidak memakainya untuk iklan pihak ketiga.",
    ],
  },
  {
    id: "pemrosesan",
    title: "4. Penyedia Layanan Pihak Ketiga",
    content: [
      "Untuk menjalankan layanan, kami memakai penyedia infrastruktur dan autentikasi cloud (penyimpanan database dan login Google), serta penyedia gerbang pembayaran QRIS. Mereka hanya memproses data sebatas yang diperlukan untuk layanan tersebut.",
      "Kami dapat membuka data bila diwajibkan oleh hukum atau permintaan resmi pihak berwenang.",
    ],
  },
  {
    id: "data_pelanggan",
    title: "5. Data Pelangganmu",
    content: [
      "Data pelanggan yang kamu simpan adalah milikmu. Kamu bertanggung jawab memastikan memiliki dasar yang sah untuk menyimpan dan menghubungi pelangganmu. Kami hanya bertindak sebagai penyedia alat pencatatan.",
    ],
  },
  {
    id: "keamanan",
    title: "6. Keamanan & Penyimpanan",
    content: [
      "Data dikirim melalui koneksi terenkripsi (HTTPS) dan disimpan dengan kontrol akses per akun toko. Kami menerapkan pembatasan akses, pemantauan, dan perlindungan terhadap serangan umum.",
      "Tidak ada sistem yang sepenuhnya kebal. Jika terjadi insiden yang berdampak pada datamu, kami akan memberi tahu sesuai ketentuan yang berlaku.",
      "Data disimpan selama akunmu aktif dan dapat dihapus atas permintaan.",
    ],
  },
  {
    id: "hak",
    title: "7. Hak Kamu",
    content: [
      `Kamu berhak mengakses, memperbaiki, mengekspor, atau meminta penghapusan data akun dan data tokomu. Kirim permintaan ke ${SITE.email} dari email yang terdaftar dan kami akan menanggapinya secepatnya.`,
    ],
  },
  {
    id: "cookie",
    title: "8. Cookie",
    content: [
      "Kami hanya memakai cookie yang diperlukan agar kamu tetap masuk (sesi login). Kami tidak memakai cookie iklan atau pelacak lintas situs.",
    ],
  },
  {
    id: "anak",
    title: "9. Pengguna di Bawah Umur",
    content: ["Layanan ditujukan untuk pelaku usaha berusia 18 tahun ke atas."],
  },
  {
    id: "perubahan",
    title: "10. Perubahan & Kontak",
    content: [
      `Kebijakan ini dapat diperbarui sewaktu-waktu; versi terbaru selalu ada di halaman ini. Pertanyaan seputar privasi: ${SITE.email}.`,
    ],
  },
];
