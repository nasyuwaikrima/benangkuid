import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendSecurityAlert } from '@/lib/telegram/alerts';
import { SITE } from '@/config/site';

// ─────────────────────────────────────────────────────────────────────────
// proxy.ts = WAF ringan + refresh sesi Supabase (menggantikan midleware.ts
// yang sebelumnya salah nama sehingga tidak pernah aktif).
// ─────────────────────────────────────────────────────────────────────────

const ownHost = new URL(SITE.url).host;
const TRUSTED_HOSTS = new Set([ownHost, `www.${ownHost.replace(/^www\./, '')}`, ownHost.replace(/^www\./, '')]);

// Endpoint yang dipanggil server lain (bukan browser) → tidak butuh Origin/Referer & tidak refresh sesi.
const MACHINE_ENDPOINTS = ['/api/payment/webhook', '/api/telegram/webhook', '/api/cron/', '/api/health'];
const isMachineEndpoint = (p: string) => MACHINE_ENDPOINTS.some((m) => p.startsWith(m));

const MALICIOUS_PATHS = [
  /\/\.env/i, /\/\.git/i, /\/wp-admin/i, /\/wp-login/i, /\/wp-content/i, /\/xmlrpc/i,
  /\/phpmyadmin/i, /\/eval-using-main-module/i, /\.\.\//, /\/etc\/passwd/i,
  /\/setup\.php/i, /\/config\.js$/i, /\.php$/i, /\.asp$/i, /\.aspx$/i,
];

const INJECTIONS = [/<script\b[^>]*>/i, /UNION\s+SELECT/i, /SELECT\s+.+\s+FROM\s/i, /DROP\s+TABLE/i, /base64_decode/i];

const BAD_AGENTS = ['sqlmap', 'nikto', 'nmap', 'dirbuster', 'gobuster', 'masscan', 'w3af', 'acunetix'];

function isTrusted(req: NextRequest, value: string | null): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).host;
    const current = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    return host === current || TRUSTED_HOSTS.has(host);
  } catch {
    return false;
  }
}

function inspect(req: NextRequest): string | null {
  const { pathname, search } = req.nextUrl;
  const ua = (req.headers.get('user-agent') ?? '').toLowerCase();

  if (BAD_AGENTS.some((a) => ua.includes(a))) return `User-Agent scanner (${ua.slice(0, 60)})`;
  if (MALICIOUS_PATHS.some((re) => re.test(pathname))) return `Path eksploit (${pathname})`;

  if (search) {
    let decoded = search;
    try { decoded = decodeURIComponent(search); } catch { /* biarkan apa adanya */ }
    if (INJECTIONS.some((re) => re.test(decoded))) return 'Pola SQLi/XSS pada query string';
  }

  // API untuk browser harus datang dari origin sendiri (blokir curl/Postman polos) — hanya produksi
  if (
    process.env.NODE_ENV === 'production' &&
    pathname.startsWith('/api/') &&
    !isMachineEndpoint(pathname) &&
    !isTrusted(req, req.headers.get('origin')) &&
    !isTrusted(req, req.headers.get('referer'))
  ) {
    return 'Akses API langsung tanpa Origin/Referer yang sah';
  }
  return null;
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = request.nextUrl;

  // 1. WAF
  const reason = inspect(request);
  if (reason) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    // Alert dikirim di belakang layar, tidak menahan respons
    event.waitUntil(
      sendSecurityAlert({
        ip,
        method: request.method,
        path: `${pathname}${search}`,
        reason,
        userAgent: request.headers.get('user-agent') ?? '',
        origin: request.headers.get('origin') ?? request.headers.get('referer') ?? undefined,
      }).catch(() => {})
    );
    return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
  }

  // 2. Webhook/cron tidak butuh sesi
  if (isMachineEndpoint(pathname)) return NextResponse.next();

  // 3. Refresh sesi Supabase (satu kali getUser). Gagal ≠ situs mati.
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  } catch (e) {
    console.error('[proxy] refresh sesi gagal:', e instanceof Error ? e.message : e);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)'],
};
