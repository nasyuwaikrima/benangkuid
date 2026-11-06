import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/config/pricing';
import { activateSubscription } from '@/lib/payment/activate';
import { Subscription } from '@/types/database';

/**
 * Helper untuk memformat string tanggal dari Pixpayz agar aman di-parse
 * sebagai Timezone Asia/Jakarta (WIB / +07:00) ke ISO String.
 */
function parsePixpayzDate(dateStr: string | undefined | null): string {
  if (!dateStr) {
    // Fallback: Default 1 jam dari sekarang jika dari API kosong
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }

  // Jika tanggal dari Pixpayz belum memiliki penanda timezone (+07:00 / Z),
  // format ulang string "YYYY-MM-DD HH:mm:ss" menjadi ISO dengan offset WIB "+07:00"
  let formattedStr = dateStr.trim();
  if (!formattedStr.includes('T') && formattedStr.includes(' ')) {
    formattedStr = formattedStr.replace(' ', 'T');
  }

  if (!formattedStr.includes('+') && !formattedStr.endsWith('Z')) {
    formattedStr += '+07:00';
  }

  const dateObj = new Date(formattedStr);
  
  // Jika parsing valid, kembalikan ISO String, jika tidak gunakan fallback 1 jam
  return isNaN(dateObj.getTime())
    ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
    : dateObj.toISOString();
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });
    }

    // =======================================================
    // 1. CEK TRANSAKSI PENDING YANG MASIH AKTIF
    // =======================================================
    const { data: rawPending } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('shop_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const pendingSub = rawPending as Subscription | null;

    if (pendingSub) {
      const isExpired = pendingSub.expired_at
        ? new Date(pendingSub.expired_at).getTime() < Date.now()
        : false;

      if (!isExpired) {
        // Masih ada transaksi pending yang aktif -> Tolak buat invoice baru
        return NextResponse.json(
          {
            success: false,
            error: 'Anda masih memiliki tagihan yang belum dibayar. Silakan selesaikan pembayaran terlebih dahulu.',
            invoice_id: pendingSub.invoice_id,
          },
          { status: 400 }
        );
      } else {
        // Transaksi pending sudah lewat batas waktu -> Tandai expired di DB
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', pendingSub.id);
      }
    }

    // =======================================================
    // 2. JIKA PAKET TRIAL (HARGA = 0)
    // =======================================================
    if (plan.priceAmount === 0) {
      const { count } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', user.id)
        .eq('plan', 'trial');

      if (count) {
        return NextResponse.json(
          { error: 'Trial sudah pernah digunakan' },
          { status: 400 }
        );
      }

      const invoiceId = `TRIAL-${user.id.slice(0, 8)}-${Date.now()}`;
      const { error } = await supabase.from('subscriptions').insert({
        shop_id: user.id,
        invoice_id: invoiceId,
        amount: 0,
        plan: plan.id as 'pro',
        status: 'pending',
      });

      if (error) {
        return NextResponse.json(
          { error: 'Gagal mengaktifkan trial' },
          { status: 500 }
        );
      }

      await activateSubscription(invoiceId);
      return NextResponse.json({ success: true, payment_link: '/dashboard' });
    }

    // =======================================================
    // 3. JIKA PAKET BERBAYAR (PIXPAYZ QRIS)
    // =======================================================
    const res = await fetch(
      `https://pixpayz.com/api/createinvoice?apikey=${process.env.PIXPAYZ_API_KEY}&amount=${plan.priceAmount}`
    );
    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { error: 'Gagal membuat tagihan ke gateway pembayaran' },
        { status: 400 }
      );
    }

    // Mengonversi expired_at dari Pixpayz agar mempertahankan offset +07:00 (WIB)
    const validExpiredAt = parsePixpayzDate(data.expired_at);

    const { error: dbError } = await supabase.from('subscriptions').insert({
      shop_id: user.id,
      invoice_id: data.invoice_id,
      amount: plan.priceAmount,
      plan: plan.id as 'pro',
      status: 'pending',
      qris_image: data.qris_image,
      expired_at: validExpiredAt,
    });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json(
        { error: 'Gagal menyimpan transaksi ke database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice_id: data.invoice_id,
      payment_link: `/dashboard/transaksi?id=${data.invoice_id}`,
    });
  } catch (e) {
    console.error('Payment API Exception:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
