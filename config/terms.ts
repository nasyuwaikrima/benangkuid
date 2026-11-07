import { getPlan, formatRupiah } from "@/config/pricing";
import { SITE } from "@/config/site";

const PRO = getPlan("pro")!;

export interface TermSection {
  id: string;
  title: string;
  content: string[];
}

export const TERMS_AND_CONDITIONS: TermSection[] = [
  {
    id: "definisi",
    title: "1. Penerimaan Syarat & Ketentuan",
    content: [
      "Dengan mendaftar dan menggunakan layanan benangku.id, Pengguna (Pemilik Toko/Penjahit) menyatakan telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan Layanan ini.",
      "Layanan ini disediakan oleh benangku.id sebagai perangkat lunak berbasis SaaS (Software as a Service) untuk pencatatan operasional usaha jahit.",
    ],
  },
  {
    id: "batasan_tanggung_jawab",
    title: "2. Batasan Tanggung Jawab Operasional (Penting)",
    content: [
      "benangku.id HANYA bertindak sebagai penyedia media digital pencatatan pesanan, ukuran badan, dan riwayat pembayaran.",
      "benangku.id TIDAK BERTANGGUNG JAWAB atas segala bentuk sengketa transaksi antara Penjahit dengan Pelanggan akhir, termasuk namun tidak terbatas pada: kesalahan pemotongan kain, ketidaksesuaian ukuran pakaian, keterlambatan pengerjaan, kerusakan bahan, maupun kegagalan pelunasan pembayaran dari pelanggan.",
      "Seluruh transaksi keuangan, uang muka (DP), dan pelunasan merupakan tanggung jawab penuh antara Pengguna dan Pelanggan akhir.",
    ],
  },
  {
    id: "langganan_pembayaran",
    title: "3. Ketentuan Langganan & Pembayaran",
    content: [
      "Setiap pendaftaran baru berhak mendapatkan masa percobaan (trial) gratis selama 14 hari.",
      `Setelah masa trial berakhir, Pengguna perlu berlangganan paket Pro seharga ${formatRupiah(PRO.priceAmount)}/${PRO.durationDays} hari untuk menambah pelanggan dan pesanan baru. Harga dapat berubah dengan pemberitahuan di dalam aplikasi.`,
      "Biaya langganan yang sudah dibayarkan bersifat non-refundable (tidak dapat dikembalikan), kecuali terjadi kesalahan penagihan atau gangguan layanan berkepanjangan dari pihak kami.",
      "Pembayaran diproses melalui QRIS dan paket aktif otomatis setelah pembayaran terkonfirmasi.",
    ],
  },
  {
    id: "privasi_data",
    title: "4. Kepemilikan & Keamanan Data Pelanggan",
    content: [
      "Data nama pelanggan, nomor WhatsApp, dan variabel ukuran badan yang diinput sepenuhnya merupakan milik Pengguna.",
      "benangku.id berkomitmen menjaga kerahasiaan data tersebut dan tidak akan menjual atau menyalahgunakan data pelanggan Pengguna kepada pihak ketiga. Rincian pengelolaan data ada di Kebijakan Privasi (/privasi).",
    ],
  },
  {
    id: "fair_use",
    title: "5. Penggunaan Yang Wajar (Fair Use Policy)",
    content: [
      "Pengguna dilarang menggunakan platform ini untuk tindakan melanggar hukum di wilayah Republik Indonesia.",
      "Pengguna dilarang menyalahgunakan fitur perpesanan/WhatsApp untuk tindakan pengiriman spam atau penipuan.",
    ],
  },
  {
    id: "perubahan_ketentuan",
    title: "6. Perubahan Ketentuan & Perundang-undangan",
    content: [
      "benangku.id berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Syarat dan Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia.",
    ],
  },
  {
    id: "kontak",
    title: "7. Kontak",
    content: [`Pertanyaan seputar layanan dan ketentuan ini dapat dikirim ke ${SITE.email}.`],
  },
];
