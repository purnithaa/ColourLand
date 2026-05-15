import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for admin session cookie on admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Allow login endpoint without cookie
    if (request.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Check for session cookie on other admin routes
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
