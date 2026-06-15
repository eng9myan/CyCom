import { NextRequest } from 'next/server';
import { odooGetSession } from '@/lib/odooServer';

export async function POST(req: NextRequest) {
  return odooGetSession(req);
}
