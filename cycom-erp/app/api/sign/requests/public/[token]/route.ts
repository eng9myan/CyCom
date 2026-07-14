import { NextRequest, NextResponse } from 'next/server';

const CYCOM_BACKEND_URL = process.env.CYCOM_BACKEND_URL || 'http://localhost:8000';

type Context = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Context) {
  const { token } = await params;
  try {
    const upstream = await fetch(`${CYCOM_BACKEND_URL}/api/sign/requests/public/${token}`, {
      method: 'GET',
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: payload.detail || 'Failed to fetch public request' }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection error' }, { status: 500 });
  }
}
