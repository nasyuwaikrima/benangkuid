import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingModal } from '@/components/dashboard/onboarding-modal';
import { PaywallBanner } from '@/components/dashboard/paywall-banner';
import { logout } from '@/app/auth/actions';
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import BottomNav from "@/components/dashboard/BottomNav";

// Beritahu Next.js 16 PPR/Cache components/dashboard bahwa route ini butuh cookie/auth (blocking dynamic)
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Auth Session
  /*const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }*/

  const { data: { user }, error } = await supabase.auth.getUser();
if (!user) {
  console.error('[dashboard/layout] tidak ada user:', error?.message);
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
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <OnboardingModal defaultOwnerName={shop?.owner_name || user.user_metadata?.full_name || 'Penjahit'} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Header Topbar Desktop */}
        <Topbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {isExpired && <PaywallBanner />}
          <div className={isExpired ? 'pointer-events-none opacity-50 select-none' : ''}>
            {children}
          </div>
        </main>
      </div>

      {/* Floating Bottom Nav Mobile */}
      <BottomNav />
    </div>
  );
}
