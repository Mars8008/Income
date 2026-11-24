import 'server-only';

import { MongoClient, type Collection, type ObjectId } from 'mongodb';

import type { AppState } from '@/lib/types';

export type UserDoc = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type StateDoc = {
  userId: ObjectId;
  data: AppState;
  /** Төхөөрөмж хоорондын давхар бичилтээс хамгаалах дугаар. Хадгалах бүрт +1. */
  version: number;
  updatedAt: Date;
};

// Dev горимд hot reload бүрт шинэ холболт нээгдэхээс сэргийлж global-д хадгална.
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI орчны хувьсагч тохируулаагүй байна (.env.local)');
  if (!g._mongo) {
    g._mongo = new MongoClient(uri).connect().then(async (c) => {
      const db = c.db(process.env.MONGODB_DB ?? 'nomio');
      await Promise.all([
        db.collection('users').createIndex({ email: 1 }, { unique: true }),
        db.collection('states').createIndex({ userId: 1 }, { unique: true }),
      ]);
      return c;
    });
    g._mongo.catch(() => {
      g._mongo = undefined;
    });
  }
  return g._mongo;
}

export async function collections(): Promise<{
  users: Collection<UserDoc>;
  states: Collection<StateDoc>;
}> {
  const db = (await client()).db(process.env.MONGODB_DB ?? 'nomio');
  return { users: db.collection<UserDoc>('users'), states: db.collection<StateDoc>('states') };
}
