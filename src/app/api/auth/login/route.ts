import bcrypt from 'bcryptjs';

import { parseCredentials } from '@/lib/server/credentials';
import { collections } from '@/lib/server/db';
import { fail, readJson, serverError } from '@/lib/server/http';
import { createSession } from '@/lib/server/session';

const WRONG = 'Имэйл эсвэл нууц үг буруу байна';

export async function POST(req: Request) {
  const creds = parseCredentials(await readJson(req));
  if (!creds.ok) return fail(400, creds.error);

  try {
    const { users } = await collections();
    const user = await users.findOne({ email: creds.email });
    if (!user || !(await bcrypt.compare(creds.password, user.passwordHash))) return fail(401, WRONG);
    await createSession(user._id.toHexString());
    return Response.json({ email: user.email });
  } catch (e) {
    return serverError(e);
  }
}
