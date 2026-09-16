import { NextResponse } from 'next/server';

// Protect admin API routes at the edge
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes (except auth login)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/chat') &&
    pathname !== '/api/complaints' // POST is public; GET is protected inside handler
  ) {
    const authHeader = request.headers.get('Authorization');
    const cookie     = request.headers.get('cookie') || '';
    const cookieToken = cookie.match(/admin_token=([^;]+)/)?.[1];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
