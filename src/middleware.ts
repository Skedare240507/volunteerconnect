import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route prefixes and the role required to access them
const PROTECTED_ROUTES = [
  "/dashboard/ngo",
  "/dashboard/admin",
  "/coordinator",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for the Firebase session cookie (set on the client side we'll use localStorage fallback)
  // For now, we rely on client-side guards in each layout. This can be expanded with server-side tokens.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/coordinator/:path*",
  ],
};
