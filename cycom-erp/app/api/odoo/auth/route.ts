import { NextRequest } from 'next/server';
import { odooAuthenticate } from '@/lib/odooServer';

export async function POST(req: NextRequest) {
  const { db, login, password } = (await req.json()) as { db?: string; login: string; password: string };
  const { res } = await odooAuthenticate(login, password, db);
  return res;
}
