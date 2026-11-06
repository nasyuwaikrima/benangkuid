// `middleware.ts`
import { NextResponse, type NextRequest } from 'next/server';

// Daftar domain yang diizinkan mengakses API (Sesuaikan domain kamu)
const ALLOWED_ORIGINS = [
  'https://benangku.web.id',
  'https://www.benangku.web.id',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

// Pola URL scanner / malicious path yang sering diserang bot
const MALICIOUS_PATH_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/eval-using-main-module/i,
  /\/\.\.\//, // Path Traversal
  /\/etc\/passwd/i,
  /\/setup\.php/i,
  /\/config\.js/i,
  /\.php$/i,
  /\.asp$/i,
  /\.aspx$/i,
];

// Pola Injection sederhana di URL/Query Params
const INJECTION_PATTERNS = [
  /<script\b[^>]*>/i,
  /UNION\s+SELECT/i,
  /SELECT\s+.*\s+FROM/i,
  /DROP\s+TABLE/i,
  /base64_decode/i,
];

// Bot / Scanner User-Agent Hitlist
const BAD_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'nmap',
  'dirbuster',
  'gobuster',
  'masscan',
  'w3af',
  'acunetix',
  'python-requests',
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const url = `${pathname}${search}`;
  const method = req.method;
  const origin = req.headers.get('origin');
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

  let blockReason: string | null = null;

  // -----------------------------------------------------------------
  // 1. FILTER BOT SCANNER DARI USER-AGENT
  // -----------------------------------------------------------------
  const isBadAgent = BAD_USER_AGENTS.some((agent) => userAgent.toLowerCase().includes(agent));
  if (isBadAgent) {
    blockReason = `Suspicious User-Agent Detected (${userAgent})`;
  }

  // -----------------------------------------------------------------
  // 2. DETEKSI ANCAMAN MALICIOUS PATH (LFI / EXPLOIT PATH)
  // -----------------------------------------------------------------
  if (!blockReason) {
    const isMaliciousPath = MALICIOUS_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
    if (isMaliciousPath) {
      blockReason = `Malicious Path / Exploit Attempt (${pathname})`;
    }
  }

  // -----------------------------------------------------------------
  // 3. DETEKSI INJECTION PAYLOAD DI URL QUERY
  // -----------------------------------------------------------------
  if (!blockReason && search) {
    const isInjection = INJECTION_PATTERNS.some((pattern) => pattern.test(search));
    if (isInjection) {
      blockReason = `SQLi / XSS Injection Pattern Detected in Query Params`;
    }
  }

  // -----------------------------------------------------------------
  // 4. BLOCK REQUEST API DARI LUAR (STRICT CORS & ORIGIN GUARD)
  // -----------------------------------------------------------------
  if (!blockReason && pathname.startsWith('/api/')) {
    // Exception: Webhook dari Payment Gateway (Pixpayz / Telegram Webhook)
    const isPublicWebhook = pathname.startsWith('/api/webhook/');

    if (!isPublicWebhook) {
      if (process.env.NODE_ENV === 'production') {
        // Jika ada header Origin, pastikan cocok dengan domain resmi
        if (origin && !ALLOWED_ORIGINS.includes(origin)) {
          blockReason = `Unauthorized External API Access (Forbidden Origin: ${origin})`;
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // JIKA TERDAPAT ANCAMAN -> BLOCK & ALERTI KE TELEGRAM
  // -----------------------------------------------------------------
  if (blockReason) {
    // Kirim Laporan ke Telegram via API internal non-blocking
    const alertData = {
      ip,
      method,
      path: url,
      reason: blockReason,
      userAgent,
      origin: origin || undefined,
    };

    // Kirim request webhook background ke Telegram agar tidak menahan response Client
    fetch(`${req.nextUrl.origin}/api/internal/telegram-alert`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_ALERT_SECRET || 'internal_secret',
      },
      body: JSON.stringify(alertData),
    }).catch((err) => console.error('Failed to trigger alert API:', err));

    // Return 403 Forbidden dengan JSON error
    return NextResponse.json(
      { success: false, error: 'Access Denied: Request blocked by Benangku Security WAF.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// Konfigurasi Matcher agar Middleware hanya mengecek endpoint penting
export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
