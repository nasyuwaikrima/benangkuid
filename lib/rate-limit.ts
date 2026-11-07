// Rate limiter in-memory (per instance). Cukup untuk 1 server / proteksi dasar.
const tracker = new Map<string, { count: number; expiresAt: number }>();
const MAX_KEYS = 5000;

export function checkRateLimit(identifier: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();

  // Bersihkan entri kedaluwarsa agar Map tidak tumbuh tanpa batas
  if (tracker.size > MAX_KEYS) {
    for (const [key, rec] of tracker) if (now > rec.expiresAt) tracker.delete(key);
  }

  const record = tracker.get(identifier);
  if (!record || now > record.expiresAt) {
    tracker.set(identifier, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}
