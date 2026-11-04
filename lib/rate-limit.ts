const requestTracker = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(identifier: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = requestTracker.get(identifier);

  if (!record || now > record.expiresAt) {
    requestTracker.set(identifier, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
