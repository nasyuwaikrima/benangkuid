// `app/api/internal/telegram-alert/route.ts`
import { NextResponse } from 'next/server';
import { sendSecurityAlertToTelegram, type ThreatDetails } from '@/lib/telegram/alert';

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-internal-secret');
    const expectedSecret = process.env.INTERNAL_ALERT_SECRET || 'internal_secret';

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized internal call' }, { status: 401 });
    }

    const body: ThreatDetails = await req.json();
    await sendSecurityAlertToTelegram(body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in internal telegram alert route:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
