import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingModal } from '@/components/dashboard/onboarding-modal';
import { PaywallBanner } from '@/components/dashboard/paywall-banner';
import { logout } from '@/app/auth/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Auth Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Query Data Toko
  const { data: shop } = await supabase
    .from('shops')
    .select('shop_name, owner_name, is_onboarded, subscription_status, trial_ends_at, pro_valid_until')
    .eq('id', user.id)
    .maybeSingle();

  const now = new Date();
  const trialEnds = shop?.trial_ends_at ? new Date(shop.trial_ends_at) : new Date(0);
  const proValid = shop?.pro_valid_until ? new Date(shop.pro_valid_until) : new Date(0);

  const isTrialExpired = shop?.subscription_status === 'trialing' && now > trialEnds;
  const isProExpired = shop?.subscription_status === 'active' && now > proValid;
  const isExpired = isTrialExpired || isProExpired || shop?.subscription_status === 'expired';

  // 3. LOCK TOTAL: Jika Belum Onboarding
  if (!shop?.is_onboarded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <OnboardingModal defaultOwnerName={shop?.owner_name || user.user_metadata?.full_name || 'Penjahit'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <h1 className="font-bold text-lg text-slate-900 truncate">{shop.shop_name}</h1>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
              isExpired
                ? 'bg-red-100 text-red-700'
                : shop.subscription_status === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isExpired ? 'EXPIRED' : shop.subscription_status.toUpperCase()}
            </span>
          </div>

          <nav className="flex flex-col gap-1.5">
            <a href="/dashboard" className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-sm transition">
              📋 Antrean Pesanan
            </a>
            <a href="/dashboard/customers" className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-sm transition">
              👥 Data Pelanggan
            </a>
          </nav>
        </div>

        {/* Action Logout */}
        <div className="pt-4 border-t border-slate-100">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left p-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm transition flex items-center gap-2"
            >
              🚪 Keluar Akun
            </button>
          </form>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-6">
        {isExpired && <PaywallBanner />}
        <div className={isExpired ? 'pointer-events-none opacity-50 select-none' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
}
