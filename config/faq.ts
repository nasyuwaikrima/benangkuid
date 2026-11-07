import { PRICING_PLANS } from "@/config/pricing";

const pro = PRICING_PLANS.find((p) => p.id === "pro")!;
const trial = PRICING_PLANS.find((p) => p.id === "trial")!;
const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Apakah benangku.id gratis?",
    a: `Kamu bisa mencoba gratis ${trial.durationDays} hari tanpa kartu kredit. Setelah itu paket Pro ${rp(pro.priceAmount)} per bulan dengan pelanggan dan pesanan tanpa batas.`,
  },
  {
    q: "Apakah harus install aplikasi?",
    a: "Tidak perlu. benangku.id berjalan di browser HP, tablet, maupun laptop. Buka lalu masuk dengan akun Google. Kalau mau, tambahkan ke layar utama HP supaya terasa seperti aplikasi.",
  },
  {
    q: "Bagaimana cara masuk dan mendaftar?",
    a: "Cukup klik “Coba Gratis”, pilih akun Google, lalu isi nama toko dan nomor WhatsApp. Tidak perlu membuat password baru dan selesai kurang dari satu menit.",
  },
  {
    q: "Data ukuran dan pelanggan saya aman?",
    a: "Data tersimpan terenkripsi di server cloud dan hanya bisa dibuka oleh akun tokomu sendiri. Kami tidak menjual atau membagikan data pelanggan kamu ke pihak lain. Detailnya ada di Kebijakan Privasi.",
  },
  {
    q: "Bagaimana cara membayar langganan?",
    a: "Pembayaran lewat QRIS, jadi bisa dari e-wallet atau mobile banking apa pun. Paket Pro aktif otomatis begitu pembayaran terkonfirmasi, biasanya dalam hitungan detik.",
  },
  {
    q: "Apa yang terjadi kalau masa aktif habis?",
    a: "Data kamu tidak dihapus. Kamu tetap bisa melihatnya, tetapi untuk menambah pelanggan atau pesanan baru perlu memperpanjang paket. Kami juga mengirim pengingat beberapa hari sebelum masa aktif berakhir.",
  },
  {
    q: "Bisa dipakai untuk lebih dari satu penjahit atau cabang?",
    a: "Saat ini satu akun untuk satu toko. Fitur tim dan multi-cabang sedang kami pertimbangkan. Kabari kami lewat halaman bantuan kalau kamu membutuhkannya.",
  },
  {
    q: "Kalau ada kendala, hubungi siapa?",
    a: "Tim kami siap membantu lewat email dan WhatsApp. Kontaknya ada di halaman Bantuan dan di bagian bawah setiap halaman.",
  },
];
