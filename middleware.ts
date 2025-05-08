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
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // 管理者ページへのアクセス制御
  // if (isAdminPage) {
  //   if (!session) {
  //     return NextResponse.redirect(new URL("/signin", request.url));
  //   }
  //   // 管理者ロールのチェック
  //   if (session.role !== "admin") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  if (isRoot) {
    //return NextResponse.redirect(new URL("/adixi-public/qa/", request.url));
    return NextResponse.redirect(new URL("/external/qa", request.url));
  }

  if (isAuthPage) {
    if (session && session.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage || isSharePage) {
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
