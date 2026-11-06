// `middleware.ts`
import { NextResponse, type NextRequest } from 'next/server';

// Daftar domain resmi benangku.web.id
const ALLOWED_ORIGINS = [
  'https://benangku.web.id',
  'https://www.benangku.web.id',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

// Pola URL scanner / exploit path
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

// Pola Injection sederhana di URL query
const INJECTION_PATTERNS = [
  /<script\b[^>]*>/i,
  /UNION\s+SELECT/i,
  /SELECT\s+.*\s+FROM/i,
  /DROP\s+TABLE/i,
  /base64_decode/i,
];

// Bot & Scanner User-Agent Hitlist
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
  const referer = req.headers.get('referer');
  const userAgent = req.headers.get('user-agent') || '';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  let blockReason: string | null = null;

  // -----------------------------------------------------------------
  // 1. FILTER BOT SCANNER BERDASARKAN USER-AGENT (Termasuk tool scanner CLI)
  // -----------------------------------------------------------------
  const isBadAgent = BAD_USER_AGENTS.some((agent) =>
    userAgent.toLowerCase().includes(agent)
  );
  if (isBadAgent) {
    blockReason = `Suspicious User-Agent Detected (${userAgent})`;
  }

  // -----------------------------------------------------------------
  // 2. DETEKSI ANCAMAN MALICIOUS PATH (LFI / EXPLOIT PATH)
  // -----------------------------------------------------------------
  if (!blockReason) {
    const isMaliciousPath = MALICIOUS_PATH_PATTERNS.some((pattern) =>
      pattern.test(pathname)
    );
    if (isMaliciousPath) {
      blockReason = `Malicious Path / Exploit Attempt (${pathname})`;
    }
  }

  // -----------------------------------------------------------------
  // 3. DETEKSI INJECTION PAYLOAD DI URL QUERY
  // -----------------------------------------------------------------
  if (!blockReason && search) {
    const isInjection = INJECTION_PATTERNS.some((pattern) =>
      pattern.test(search)
    );
    if (isInjection) {
      blockReason = `SQLi / XSS Injection Pattern Detected in Query Params`;
    }
  }

  // -----------------------------------------------------------------
  // 4. STRICT API GUARD: BLOKIR CURL / DIRECT API CALL DARI LUAR
  // -----------------------------------------------------------------
  if (!blockReason && pathname.startsWith('/api/')) {
    // Pengecualian: Webhook dari Payment Gateway & Telegram
    const isPublicWebhook =
      pathname.startsWith('/api/webhook/') ||
      pathname.startsWith('/api/internal/');

    if (!isPublicWebhook && process.env.NODE_ENV === 'production') {
      const hasValidOrigin = origin && ALLOWED_ORIGINS.includes(origin);
      const hasValidReferer =
        referer && ALLOWED_ORIGINS.some((domain) => referer.startsWith(domain));

      // Jika tidak membawa Origin maupun Referer resmi (ciri khas cURL / Postman tanpa header khusus), BLOKIR!
      if (!hasValidOrigin && !hasValidReferer) {
        blockReason = `Direct API Access Blocked (Missing or Invalid Origin/Referer via CLI/cURL)`;
      }
    }
  }

  // -----------------------------------------------------------------
  // JIKA TERDAPAT ANCAMAN -> BLOCK & KIRIM TELEGRAM ALERT
  // -----------------------------------------------------------------
  if (blockReason) {
    const alertData = {
      ip,
      method,
      path: url,
      reason: blockReason,
      userAgent,
      origin: origin || referer || undefined,
    };

    // Kirim webhook internal di background agar tidak membebani response time
    fetch(`${req.nextUrl.origin}/api/internal/telegram-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret':
          process.env.INTERNAL_ALERT_SECRET || 'internal_secret',
      },
      body: JSON.stringify(alertData),
    }).catch((err) => console.error('Failed to trigger alert API:', err));

    return NextResponse.json(
      {
        success: false,
        error: 'Access Denied: Request blocked by Benangku WAF Security.',
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
