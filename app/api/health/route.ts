import { NextResponse } from 'next/server';

// Untuk uptime monitor (UptimeRobot, dsb). Tidak membuka data sensitif.
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'benangku.id' }, { headers: { 'Cache-Control': 'no-store' } });
}
