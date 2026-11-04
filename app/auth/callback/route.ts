import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const providerError =
    searchParams.get('error_description') ?? searchParams.get('error');

  // Cegah open redirect
  let next = searchParams.get('next') ?? '/dashboard';
  if (!next.startsWith('/') || next.startsWith('//')) next = '/dashboard';

  // Base URL yang benar di belakang proxy
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http';
  const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  const fail = (message: string, detail?: unknown) => {
    console.error('[auth/callback] gagal:', message, detail ?? '');
    return NextResponse.redirect(
      `${baseUrl}/login?error=auth-failed&message=${encodeURIComponent(message)}`
    );
  };

  if (providerError) return fail(`Provider error: ${providerError}`);
  if (!code) return fail('Parameter "code" tidak ada di URL callback');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return fail(
      `${error.name}: ${error.message} (status ${error.status ?? '-'})`,
      error
    );
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}