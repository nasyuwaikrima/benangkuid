import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/config/pricing';
import { activateSubscription } from '@/lib/payment/activate';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json();
    const plan = getPlan(planId);
    if (!plan) return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });

    // Trial: gratis, hanya 1x
    if (plan.priceAmount === 0) {
      const { count } = await supabase
        .from('subscriptions').select('id', { count: 'exact', head: true })
        .eq('shop_id', user.id).eq('plan', 'trial');
      if (count) return NextResponse.json({ error: 'Trial sudah pernah digunakan' }, { status: 400 });

      const invoiceId = `TRIAL-${user.id.slice(0, 8)}-${Date.now()}`;
      const { error } = await supabase.from('subscriptions').insert({
        shop_id: user.id, invoice_id: invoiceId, amount: 0, plan: plan.id, status: 'pending',
      });
      if (error) return NextResponse.json({ error: 'Gagal mengaktifkan trial' }, { status: 500 });

      await activateSubscription(invoiceId);
      return NextResponse.json({ success: true, payment_link: '/dashboard' });
    }

    // Berbayar: harga dari server
    const res = await fetch(
      `https://pixpayz.com/api/createinvoice?apikey=${process.env.PIXPAYZ_API_KEY}&amount=${plan.priceAmount}`
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: 'Gagal membuat tagihan' }, { status: 400 });

    const { error: dbError } = await supabase.from('subscriptions').insert({
      shop_id: user.id,
      invoice_id: data.invoice_id,
      amount: plan.priceAmount,
      plan: plan.id,              // simpan id, bukan nama
      status: 'pending',
      qris_image: data.qris_image,
      expired_at: data.expired_at,
    });
    if (dbError) {
      console.error(dbError);
      return NextResponse.json({ error: 'Gagal menyimpan transaksi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payment_link: `/dashboard/transaksi?id=${data.invoice_id}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}