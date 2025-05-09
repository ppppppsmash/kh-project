import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isRoot = request.nextUrl.pathname === "/";
  // マネージャー以上
  const isSuperAdminAuthPage = request.nextUrl.pathname.startsWith("/signin?role=superadmin");
  // リーダー以上
  const isAdminAuthPage = request.nextUrl.pathname.startsWith("/signin");
  // リーダー以上
  const isSharePage = request.nextUrl.pathname.startsWith("/external");
  //const isSuperAdminPage = request.nextUrl.pathname.startsWith("/superadmin");

  if (isRoot) {
    return NextResponse.redirect(new URL("/external/qa", request.url));
  }

  if (isSuperAdminAuthPage) {
    if (session && session.role === "superadmin") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminAuthPage) {
    if (session && session.role === "admin") {
      return NextResponse.redirect(new URL("/adixi-public/qa", request.url));
    }
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
