import { authMiddleware } from "@study-streaks/auth";

/**
 * Next.js middleware for StudyStreaks web application
 * Handles authentication and authorization for all routes
 */

export default authMiddleware;

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};