import { NextRequest, NextResponse } from 'next/server';

const CYCOM_BACKEND_URL = process.env.CYCOM_BACKEND_URL || 'http://localhost:8000';

type Context = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Context) {
  const { token } = await params;
  try {
    const body = await req.json();
    const upstream = await fetch(`${CYCOM_BACKEND_URL}/api/sign/requests/public/${token}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: payload.detail || 'Signing failed' }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection error' }, { status: 500 });
  }
}
