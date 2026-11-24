import 'server-only';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Имэйл, нууц үгийг шалгана. Алдаатай бол мессеж, зөв бол цэвэрлэсэн утгууд. */
export function parseCredentials(
  body: unknown
): { ok: true; email: string; password: string } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Буруу хүсэлт' };
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 200) {
    return { ok: false, error: 'Имэйл хаяг буруу байна' };
  }
  if (typeof password !== 'string' || password.length < 8) {
    return { ok: false, error: 'Нууц үг дор хаяж 8 тэмдэгт байх ёстой' };
  }
  // bcrypt нь 72 байтаас урт нууц үгийг тайрдаг.
  if (new TextEncoder().encode(password).length > 72) {
    return { ok: false, error: 'Нууц үг хэт урт байна' };
  }
  return { ok: true, email: email.trim().toLowerCase(), password };
}
