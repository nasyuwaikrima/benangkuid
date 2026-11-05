import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchPixpayzStatus, activateSubscription } from '@/lib/payment/activate';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id diperlukan' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Pastikan invoice milik user ini (RLS juga membantu)
  const { data: own } = await supabase
    .from('subscriptions').select('invoice_id').eq('invoice_id', id).eq('shop_id', user.id).maybeSingle();
  if (!own) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  try {
    const data = await fetchPixpayzStatus(id);
    if (data.status === 'paid') await activateSubscription(id);
    return NextResponse.json({ status: data.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Gagal mengecek status' }, { status: 500 });
  }
}