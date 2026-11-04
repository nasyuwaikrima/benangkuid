// app/api/debug/session/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  return NextResponse.json({
    user: user?.id ?? null,
    error: error?.message ?? null,
    cookieNames: cookieStore.getAll().map((c) => c.name),
  });
}