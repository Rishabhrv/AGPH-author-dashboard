import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/login'

  // Exclude api routes if they are meant to be public, but in our case, 
  // auth routes are external (localhost:5001). Next.js API routes could be excluded if needed.

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    // Validate token against backend
    const apiUrl = process.env.API_URL || "http://localhost:5001";
    try {
      const res = await fetch(`${apiUrl}/api/author/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.valid) {
        // Token is invalid or expired
        if (!isLoginPage) {
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('auth_token');
          return response;
        } else {
          const response = NextResponse.next();
          response.cookies.delete('auth_token');
          return response;
        }
      } else if (isLoginPage) {
        // Token is valid and trying to access login page
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      // If backend is unreachable, we fall back to default behavior
      // to avoid completely breaking the site. 
      if (isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
