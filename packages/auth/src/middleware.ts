import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@study-streaks/config";

/**
 * Authentication and authorization middleware for StudyStreaks
 * Handles multi-tenant access control and role-based permissions
 */

interface AuthToken {
  id: string;
  email: string;
  schoolId: string;
  schoolName: string;
  userType: "teacher" | "student" | "parent" | "schoolAdmin";
  permissions: Array<{
    name: string;
    resource: string;
    action: string;
    scope: string;
    category: string;
    riskLevel: string;
  }>;
  roles: Array<{
    id: string;
    name: string;
    scope: string;
    classIds: string[];
    yearGroups: number[];
    subjects: string[];
    studentIds: string[];
  }>;
}

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  "/dashboard",
  "/admin", 
  "/teacher",
  "/parent",
  "/student",
  "/classes",
  "/homework",
  "/clubs",
  "/reports",
  "/settings",
  "/api/protected",
];

/**
 * Routes that require specific user types
 */
const roleBasedRoutes = {
  "/admin": ["schoolAdmin", "teacher"],
  "/teacher": ["teacher", "schoolAdmin"],
  "/parent": ["parent"],
  "/student": ["student"],
  "/api/admin": ["schoolAdmin"],
  "/api/teacher": ["teacher", "schoolAdmin"],
  "/api/parent": ["parent"],
  "/api/student": ["student"],
};

/**
 * Routes that are public (no authentication required)
 */
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup", 
  "/auth/error",
  "/auth/verify-request",
  "/api/auth",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

/**
 * Main middleware function
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Get the authentication token
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    }) as AuthToken | null;

    // Redirect to signin if not authenticated
    if (!token) {
      return redirectToSignIn(request);
    }

    // Check if route requires specific user type
    const requiredUserTypes = getRoleRequirement(pathname);
    if (requiredUserTypes && !requiredUserTypes.includes(token.userType)) {
      return new NextResponse("Access Denied: Insufficient permissions", { 
        status: 403 
      });
    }

    // Check for protected routes
    if (isProtectedRoute(pathname)) {
      // Validate user is active and has basic access
      if (!token.schoolId) {
        return new NextResponse("Access Denied: No school access", { 
          status: 403 
        });
      }

      // Check specific permissions for API routes
      if (pathname.startsWith("/api/")) {
        const hasApiAccess = await checkApiPermissions(token, pathname);
        if (!hasApiAccess) {
          return new NextResponse("Access Denied: Insufficient API permissions", { 
            status: 403 
          });
        }
      }

      // Add security headers
      const response = NextResponse.next();
      response.headers.set("X-School-ID", token.schoolId);
      response.headers.set("X-User-Type", token.userType);
      response.headers.set("X-User-ID", token.id);
      
      return response;
    }

    // Default redirect based on user type if accessing root with auth
    if (pathname === "/" && token) {
      return redirectBasedOnUserType(token);
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
    return redirectToSignIn(request);
  }
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get required user types for a route
 */
function getRoleRequirement(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Check API-specific permissions
 */
async function checkApiPermissions(token: AuthToken, pathname: string): Promise<boolean> {
  // Extract resource and action from API path
  const pathParts = pathname.split("/");
  
  // /api/students -> resource: "students", action: "read"
  // /api/students/[id] -> resource: "students", action: "read"
  // /api/students (POST) -> resource: "students", action: "write"
  
  if (pathParts[2]) {
    const resource = pathParts[2];
    
    // Check if user has any permission for this resource
    const hasPermission = token.permissions.some(permission => 
      permission.resource === resource || permission.resource === "all"
    );
    
    return hasPermission;
  }
  
  return true; // Allow other API routes by default
}

/**
 * Redirect to sign in page
 */
function redirectToSignIn(request: NextRequest): NextResponse {
  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", request.url);
  return NextResponse.redirect(signInUrl);
}

/**
 * Redirect based on user type
 */
function redirectBasedOnUserType(token: AuthToken): NextResponse {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  switch (token.userType) {
    case "teacher":
      return NextResponse.redirect(`${baseUrl}/teacher/dashboard`);
    case "schoolAdmin":
      return NextResponse.redirect(`${baseUrl}/admin/dashboard`);
    case "parent":
      return NextResponse.redirect(`${baseUrl}/parent/dashboard`);
    case "student":
      return NextResponse.redirect(`${baseUrl}/student/dashboard`);
    default:
      return NextResponse.redirect(`${baseUrl}/dashboard`);
  }
}

/**
 * Utility function to check permissions in API routes
 */
export function requirePermission(
  userPermissions: AuthToken["permissions"],
  resource: string,
  action: string,
  scope?: string
): boolean {
  return userPermissions.some(permission => 
    (permission.resource === resource || permission.resource === "all") &&
    (permission.action === action || permission.action === "manage") &&
    (!scope || permission.scope === scope || permission.scope === "all")
  );
}

/**
 * Utility function to check school access
 */
export function requireSchoolAccess(userSchoolId: string, resourceSchoolId: string): boolean {
  return userSchoolId === resourceSchoolId;
}

/**
 * Extract user context from request headers (set by middleware)
 */
export function getUserContext(request: NextRequest) {
  return {
    schoolId: request.headers.get("X-School-ID"),
    userType: request.headers.get("X-User-Type") as AuthToken["userType"],
    userId: request.headers.get("X-User-ID"),
  };
}