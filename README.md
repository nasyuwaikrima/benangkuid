# benangku.id

Aplikasi catatan order untuk penjahit & konveksi: ukuran pelanggan, antrean, DP & pelunasan.
Next.js 16 · Supabase · Pixpayz (QRIS) · Telegram bot admin.

## Mulai

```bash
npm install
cp .env.example .env.local   # lalu isi semua nilainya
npm run dev
```

## Kontak & identitas

Semua kontak ada di **`config/site.ts`**. Cukup atur di env:

| Env | Isi |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | nomor CS, format `62…` (kosong = tombol WhatsApp disembunyikan) |
| `NEXT_PUBLIC_APP_URL` | `https://benangku.id` |

Email support: `support@benangku.id`.

## Telegram bot admin

1. Buat bot di @BotFather → isi `TELEGRAM_BOT_TOKEN`.
2. Isi `TELEGRAM_WEBHOOK_SECRET` (acak, huruf/angka/`_`/`-`) dan `TELEGRAM_ADMIN_IDS` (user ID Telegram, pisah koma).
3. Setelah deploy: `npm run telegram:setup` (mendaftarkan webhook + menu perintah).
4. Kirim `/help` ke bot.

| Perintah | Fungsi |
| --- | --- |
| `/stats` | ringkasan toko, Pro/Trial aktif, order hari ini, omzet 30 hari |
| `/cari kata` | cari toko berdasarkan email / nama / WA |
| `/perpanjang email 30` | tambah masa aktif Pro (hari) |
| `/notif` `/promo` `/peringatan` | broadcast ke semua toko (`Judul \| Isi`) |
| `/kirim email \| Judul \| Isi` | pesan ke satu toko |
| `/list` `/hapus ID` | kelola notifikasi |

Alert otomatis ke admin: toko baru, pembayaran masuk, serangan yang diblokir WAF, dan ringkasan harian.

## Cron harian

Mengirim pengingat in-app (Pro/Trial berakhir ≤ 3 hari, tanpa duplikat) dan ringkasan harian ke Telegram.

```cron
0 8 * * *  curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://benangku.id/api/cron/daily
```

## Operasional

- Health check untuk uptime monitor: `GET /api/health`
- Webhook pembayaran: `POST /api/payment/webhook`
- `proxy.ts` = WAF ringan + refresh sesi Supabase (menggantikan `midleware.ts`)

## Checklist sebelum launching

- [ ] Semua env di `.env.example` terisi di server produksi
- [ ] Redirect URL Google OAuth + Supabase memakai domain produksi
- [ ] Webhook Pixpayz menunjuk ke `/api/payment/webhook`
- [ ] `npm run telegram:setup` sudah dijalankan
- [ ] Cron harian terpasang
- [ ] `npm run build` lolos tanpa error
