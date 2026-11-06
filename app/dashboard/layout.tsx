import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { OnboardingModal } from '@/components/dashboard/onboarding-modal';
import { PaywallBanner } from '@/components/dashboard/paywall-banner';
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import BottomNav from "@/components/dashboard/BottomNav";
import { checkShopAccess } from '@/lib/subscription';
import { getNotifications } from '@/lib/notifications';

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  // 1. Cek User Auth Session
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) {
    console.error('[dashboard/layout] tidak ada user:', error?.message);
    redirect('/login');
  }

  // 2. Query Data Toko & Jumlah Pelanggan Saat Ini
  const [{ data: shop }, { count: customerCount }, notifications] = await Promise.all([
    supabase
      .from('shops')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', user.id),
    getNotifications(supabase, user.created_at),
  ]);

  // 3. LOCK TOTAL: Jika Belum Onboarding
  if (!shop?.is_onboarded) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <OnboardingModal defaultOwnerName={shop?.owner_name || user.user_metadata?.full_name || 'Penjahit'} />
      </div>
    );
  }

  // 4. Hitung Status Berlangganan & Batasan Limit Kuota
  const access = shop ? checkShopAccess(shop, customerCount || 0, 0) : undefined;

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0"> 
        <Topbar 
          ownerName={shop?.owner_name || user.user_metadata?.full_name || 'Penjahit'} 
          shopName={shop?.shop_name || 'Toko Saya'} 
          shopId={user.id}
          initialNotifications={notifications}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <PaywallBanner access={access} />
          <div className={access?.isExpired ? 'pointer-events-none opacity-50 select-none' : ''}>
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
