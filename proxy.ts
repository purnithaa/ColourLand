import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (request.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const adminSession = request.cookies.get('admin_session');
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
