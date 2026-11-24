import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';

import { parseCredentials } from '@/lib/server/credentials';
import { collections } from '@/lib/server/db';
import { fail, readJson, serverError } from '@/lib/server/http';
import { createSession } from '@/lib/server/session';

export async function POST(req: Request) {
  const creds = parseCredentials(await readJson(req));
  if (!creds.ok) return fail(400, creds.error);

  try {
    const { users } = await collections();
    const passwordHash = await bcrypt.hash(creds.password, 10);
    const { insertedId } = await users.insertOne({ email: creds.email, passwordHash, createdAt: new Date() });
    await createSession(insertedId.toHexString());
    return Response.json({ email: creds.email });
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return fail(409, 'Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна');
    }
    return serverError(e);
  }
}
