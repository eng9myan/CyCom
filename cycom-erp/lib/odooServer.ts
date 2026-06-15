/**
 * Server-only helpers for talking to the Odoo container.
 * Used by /api/odoo/* route handlers. Never import this from a client component.
 *
 * Odoo speaks JSON-RPC at /web/session/authenticate (login) and /web/dataset/call_kw (model calls).
 * Session is tracked by the `session_id` cookie that Odoo sets on /web/session/authenticate.
 * We forward that cookie between the browser and Odoo via a single httpOnly cookie named
 * `cycom_session_id`.
 */

import { NextRequest, NextResponse } from 'next/server';

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DB || 'cycom';
const SESSION_COOKIE = 'cycom_session_id';

function getSessionId(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

function applySessionCookie(res: NextResponse, odooSetCookie: string | null): void {
  if (!odooSetCookie) return;
  // Parse just `session_id=...` out of one or more Set-Cookie strings.
  const match = odooSetCookie.match(/session_id=([^;]+)/);
  if (!match) return;
  res.cookies.set({
    name: SESSION_COOKIE,
    value: match[1],
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function odooAuthenticate(login: string, password: string, db?: string): Promise<{
  res: NextResponse;
  user?: { uid: number; name: string; username: string; partner_id: number; company_id: number; is_admin: boolean };
  error?: string;
}> {
  const upstream = await fetch(`${ODOO_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      params: { db: db || ODOO_DB, login, password },
    }),
  });

  const payload = (await upstream.json()) as {
    result?: { uid?: number | false; name?: string; username?: string; partner_id?: number; company_id?: number; is_admin?: boolean };
    error?: { data?: { message?: string }; message?: string };
  };

  if (payload.error) {
    const res = NextResponse.json(
      { error: payload.error.data?.message || payload.error.message || 'Authentication failed' },
      { status: 401 },
    );
    return { res, error: payload.error.data?.message || payload.error.message };
  }
  if (!payload.result?.uid) {
    const res = NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    return { res, error: 'Invalid credentials' };
  }

  const user = {
    uid: payload.result.uid as number,
    name: payload.result.name ?? '',
    username: payload.result.username ?? login,
    partner_id: payload.result.partner_id ?? 0,
    company_id: payload.result.company_id ?? 0,
    is_admin: Boolean(payload.result.is_admin),
  };

  const res = NextResponse.json({ user });
  applySessionCookie(res, upstream.headers.get('set-cookie'));
  return { res, user };
}

export async function odooCallKw(req: NextRequest, body: { model: string; method: string; args?: unknown[]; kwargs?: Record<string, unknown> }): Promise<NextResponse> {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return NextResponse.json({ error: { message: 'Not authenticated' } }, { status: 401 });
  }
  const upstream = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `session_id=${sessionId}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      params: {
        model: body.model,
        method: body.method,
        args: body.args || [],
        kwargs: body.kwargs || {},
      },
    }),
  });
  const payload = await upstream.json();
  return NextResponse.json(payload);
}

export async function odooLogout(req: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(req);
  if (sessionId) {
    await fetch(`${ODOO_URL}/web/session/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `session_id=${sessionId}` },
      body: JSON.stringify({ jsonrpc: '2.0', params: {} }),
    }).catch(() => undefined);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export async function odooGetSession(req: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return NextResponse.json({ user: null });
  }
  const upstream = await fetch(`${ODOO_URL}/web/session/get_session_info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `session_id=${sessionId}` },
    body: JSON.stringify({ jsonrpc: '2.0', params: {} }),
  });
  const payload = (await upstream.json()) as {
    result?: { uid?: number | false; name?: string; username?: string; partner_id?: number; company_id?: number; is_admin?: boolean };
  };
  if (!payload.result?.uid) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      uid: payload.result.uid as number,
      name: payload.result.name ?? '',
      username: payload.result.username ?? '',
      partner_id: payload.result.partner_id ?? 0,
      company_id: payload.result.company_id ?? 0,
      is_admin: Boolean(payload.result.is_admin),
    },
  });
}
