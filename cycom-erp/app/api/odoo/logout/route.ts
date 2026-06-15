import { NextRequest } from 'next/server';
import { odooLogout } from '@/lib/odooServer';

export async function POST(req: NextRequest) {
  return odooLogout(req);
}
