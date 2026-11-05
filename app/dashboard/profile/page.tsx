import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server'; // <-- 1. IMPORT CONNECTION
import { logout } from '@/app/auth/actions';
import Link from 'next/link';
import { PRICING_PLANS, formatRupiah } from '@/config/pricing';
import { 
  Store, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  LogOut, 
  CheckCircle2, 
  ExternalLink,
  Edit3
} from 'lucide-react';

export const instant = false;

export default async function ProfilePage() {
  await connection(); // <-- 2. TAMBAHKAN BARIS INI DI PALING ATAS FUNGSI!

  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Query Data Toko dari DB (Sesuai Schema Table `shops`)
  const { data: shop } = await supabase
    .from('shops')
    .select('shop_name, owner_name, whatsapp_number, is_onboarded, subscription_status, trial_ends_at, pro_valid_until')
    .eq('id', user.id)
    .maybeSingle();

  // 3. Hitung Status Expired & Format Tanggal
  const now = new Date();
  const trialEnds = shop?.trial_ends_at ? new Date(shop.trial_ends_at) : null;
  const proValid = shop?.pro_valid_until ? new Date(shop.pro_valid_until) : null;

  const isTrialExpired = shop?.subscription_status === 'trialing' && trialEnds && now > trialEnds;
  const isProExpired = shop?.subscription_status === 'active' && proValid && now > proValid;
  const isExpired = isTrialExpired || isProExpired || shop?.subscription_status === 'expired';

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const ownerName = shop?.owner_name || user.user_metadata?.full_name || 'Penjahit';
  const shopName = shop?.shop_name || 'Toko Saya';
  const subStatus = shop?.subscription_status || 'trialing';

  // 4. Sinkronisasi dengan Modular Pricing Plans (ID 'pro' & 'trial')
  const proPlan = PRICING_PLANS.find((p) => p.id === 'pro');
  const trialPlan = PRICING_PLANS.find((p) => p.id === 'trial');
  
  // Ambil data plan aktif sesuai status DB
  const currentPlan = subStatus === 'active' ? proPlan : trialPlan;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      
      {/* HEADER BANNER PROFIL */}
      <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/20 shrink-0">
              {ownerName.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                  {shopName}
                </h1>
                
                {/* Badge Status Langganan Utama */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  isExpired
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : subStatus === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isExpired ? 'bg-red-400' : subStatus === 'active' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`} />
                  {isExpired 
                    ? 'EXPIRED' 
                    : subStatus === 'active' 
                    ? `PAKET ${proPlan?.name.toUpperCase()}` 
                    : 'MASA TRIAL (14 HARI)'}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Pemilik: <strong className="text-slate-200 font-semibold">{ownerName}</strong></span>
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/pengaturan"
            className="self-start md:self-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span>Edit Profil</span>
          </Link>
        </div>
      </div>


      {/* GRID CARDS PROFIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARD 1: IDENTITAS TOKO */}
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Identitas Usaha Jahit</h2>
              <p className="text-[11px] text-slate-400">Detail identitas fisik toko</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Nama Toko</span>
              <p className="text-sm font-semibold text-slate-100">{shopName}</p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Nama Pemilik (Owner)</span>
              <p className="text-sm font-semibold text-slate-100">{ownerName}</p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">WhatsApp Bisnis</span>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {shop?.whatsapp_number || 'Belum diisi'}
                </p>
                {shop?.whatsapp_number && (
                  <a
                    href={`https://wa.me/${shop.whatsapp_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Tes WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* CARD 2: INFORMASI AKUN */}
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Informasi Akun</h2>
              <p className="text-[11px] text-slate-400">Status verifikasi & akses sistem</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Email Terdaftar</span>
              <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Status Onboarding</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terverifikasi & Aktif</span>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* CARD 3: MANAJEMEN LANGGANAN (BILLING / SUBSCRIPTION) */}
      <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-lg">
        {/* Header Billing */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Status Langganan Aplikasi</h2>
              <p className="text-[11px] text-slate-400">
                {currentPlan?.name || 'Uji Coba'} — Paket {subStatus === 'active' ? 'Berlangganan' : 'Uji Coba'}
              </p>
            </div>
          </div>

          {/* Tag Harga Dinamis ngikutin currentPlan */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isExpired
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : subStatus === 'active' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
          }`}>
            {isExpired
              ? 'Expired'
              : currentPlan
              ? `${formatRupiah(currentPlan.priceAmount)} ${currentPlan.period}`
              : 'Rp 0 / 14 hari'}
          </span>
        </div>

        {/* Content Details Billing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {subStatus === 'active' ? 'Masa Aktif Paket Pro' : 'Masa Berlaku Trial'}
            </span>
            <p className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-white'}`}>
              {subStatus === 'active' ? formatDate(proValid) : formatDate(trialEnds)}
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                {isExpired ? 'Masa Aktif Habis' : subStatus === 'trialing' ? 'Upgrade ke Pro' : 'Perpanjang Masa Aktif'}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {subStatus === 'trialing' ? 'Akses Tanpa Batas' : 'Pilih Pembayaran QRIS'}
              </span>
            </div>
            
            <Link
              href="/dashboard/upgrade"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition shrink-0"
            >
              <span>{isExpired ? 'Aktifkan Lagi' : subStatus === 'trialing' ? 'Upgrade Pro' : 'Perpanjang'}</span>
            </Link>
          </div>
        </div>
      </div>


      {/* ACTION LOGOUT */}
      <div className="pt-2 flex justify-end">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </form>
      </div>

    </div>
  );
}
