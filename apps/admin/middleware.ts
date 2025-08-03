import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * StudyStreaks Admin Middleware
 * Protects admin routes and ensures only school administrators can access
 */
export default withAuth(
  function middleware(req) {
    // Additional checks can be added here
    const token = req.nextauth.token;
    
    // Verify user has admin privileges
    if (token && (token.userType === 'schoolAdmin' || token.userType === 'admin')) {
      return NextResponse.next();
    }
    
    // If user is authenticated but not admin, redirect to access denied
    if (token) {
      return NextResponse.redirect(new URL('/auth/access-denied', req.url));
    }
    
    // If not authenticated, will be handled by withAuth
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except auth routes
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true;
        }
        
        // Require authentication for all other routes
        if (!token) {
          return false;
        }
        
        // Require admin privileges
        return token.userType === 'schoolAdmin' || token.userType === 'admin';
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};