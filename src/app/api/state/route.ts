import { collections } from '@/lib/server/db';
import { fail, readJson, serverError } from '@/lib/server/http';
import { currentUserId } from '@/lib/server/session';
import type { AppState } from '@/lib/types';

const MAX_BYTES = 2_000_000;

/** Нэвтэрсэн хэрэглэгчийн бүх өгөгдөл. Хоосон бол data: null. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return fail(401, 'Нэвтрээгүй байна');
  try {
    const { users, states } = await collections();
    const [user, doc] = await Promise.all([
      users.findOne({ _id: userId }, { projection: { email: 1 } }),
      states.findOne({ userId }),
    ]);
    if (!user) return fail(401, 'Хэрэглэгч олдсонгүй');
    return Response.json({ email: user.email, data: doc?.data ?? null, version: doc?.version ?? 0 });
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Өгөгдлийг хадгална. Клиент сүүлд уншсан `version`-оо явуулна.
 * Өөр төхөөрөмж хооронд нь хадгалсан бол 409 + серверийн одоогийн өгөгдлийг буцаана.
 */
export async function PUT(req: Request) {
  const userId = await currentUserId();
  if (!userId) return fail(401, 'Нэвтрээгүй байна');

  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_BYTES) return fail(413, 'Өгөгдөл хэт том байна');

  const body = (await readJson(req)) as { data?: unknown; version?: unknown } | null;
  if (!body || typeof body.version !== 'number' || !isAppState(body.data)) {
    return fail(400, 'Буруу өгөгдөл');
  }

  try {
    const { states } = await collections();
    const now = new Date();
    if (body.version === 0) {
      // Анх удаа хадгалж байна.
      const res = await states.updateOne(
        { userId },
        { $setOnInsert: { userId, data: body.data, version: 1, updatedAt: now } },
        { upsert: true }
      );
      if (res.upsertedCount === 1) return Response.json({ version: 1 });
    } else {
      const res = await states.updateOne(
        { userId, version: body.version },
        { $set: { data: body.data, updatedAt: now }, $inc: { version: 1 } }
      );
      if (res.modifiedCount === 1) return Response.json({ version: body.version + 1 });
    }
    const current = await states.findOne({ userId });
    return Response.json(
      { error: 'conflict', data: current?.data ?? null, version: current?.version ?? 0 },
      { status: 409 }
    );
  } catch (e) {
    return serverError(e);
  }
}

function isAppState(v: unknown): v is AppState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    !!s.profile &&
    typeof s.profile === 'object' &&
    Array.isArray(s.categories) &&
    Array.isArray(s.transactions) &&
    Array.isArray(s.debts) &&
    !!s.budgets &&
    typeof s.budgets === 'object'
  );
}
