import { NextRequest, NextResponse } from 'next/server';

const CYCOM_BACKEND_URL = process.env.CYCOM_BACKEND_URL || 'http://localhost:8000';
const SESSION_COOKIE = 'cycom_session_id';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${CYCOM_BACKEND_URL}/api/enterprise/audit/rebuild-hashes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
      },
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: payload.detail || 'Rebuild hashes failed' }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection error' }, { status: 500 });
  }
}
