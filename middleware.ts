import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isRoot = request.nextUrl.pathname === "/";
  const isPublicPage = request.nextUrl.pathname.startsWith("/adixi-public");
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin");
  const isSharePage = request.nextUrl.pathname.startsWith("/external");

  if (isRoot) {
    return NextResponse.redirect(new URL("/adixi-public/intro-card/", request.url));
  }

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (isSharePage) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
