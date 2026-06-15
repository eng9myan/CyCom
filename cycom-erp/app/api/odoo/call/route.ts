import { NextRequest } from 'next/server';
import { odooCallKw } from '@/lib/odooServer';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { model: string; method: string; args?: unknown[]; kwargs?: Record<string, unknown> };
  return odooCallKw(req, body);
}
