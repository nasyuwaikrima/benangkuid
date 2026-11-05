import { NextResponse } from 'next/server';
import { fetchPixpayzStatus, activateSubscription } from '@/lib/payment/activate';

export async function POST(req: Request) {
  try {
    const { event, data } = await req.json();
    const webhookEvent = req.headers.get('x-webhook-event') || event;
    const invoiceId = data?.id || data?.reference;

    if (webhookEvent === 'deposit.paid' && invoiceId) {
      const check = await fetchPixpayzStatus(invoiceId);
      if (check.status === 'paid') await activateSubscription(invoiceId);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}