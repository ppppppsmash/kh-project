import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: "test",
  });
  const isAuthenticated = !!token;

  const isSharePage = request.nextUrl.pathname.startsWith("/share-page");
  const isRoot = request.nextUrl.pathname === "/";
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin");

  if (isSharePage) {
    return NextResponse.next();
  }

  if (isRoot) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
