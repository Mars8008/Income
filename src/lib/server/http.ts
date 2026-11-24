import 'server-only';

import { NextResponse } from 'next/server';

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Хүсэлтийн JSON-ийг аюулгүй уншина (буруу бол null). */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Серверийн алдааг log-д бичээд хэрэглэгчид ерөнхий мессеж буцаана. */
export function serverError(e: unknown) {
  console.error(e);
  return fail(500, 'Серверт алдаа гарлаа. Дахин оролдоно уу.');
}
