import { NextRequest, NextResponse } from 'next/server';

const CYCOM_BACKEND_URL = process.env.CYCOM_BACKEND_URL || 'http://localhost:8000';
const SESSION_COOKIE = 'cycom_session_id';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${CYCOM_BACKEND_URL}/api/sign/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
      },
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: payload.detail || 'Failed to fetch templates' }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    
    // Create new FormData to send to backend
    const sendData = new FormData();
    const file = formData.get('file');
    const name = formData.get('name');
    const fieldsConfig = formData.get('fields_config');

    if (file) sendData.append('file', file);
    if (name) sendData.append('name', name);
    if (fieldsConfig) sendData.append('fields_config', fieldsConfig);

    const upstream = await fetch(`${CYCOM_BACKEND_URL}/api/sign/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionId}`,
      },
      body: sendData,
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: payload.detail || 'Failed to upload template' }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection error' }, { status: 500 });
  }
}
