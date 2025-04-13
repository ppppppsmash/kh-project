import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  const isAuthenticated = !!token;

  const isRoot = request.nextUrl.pathname === "/";
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin");

  if (isAuthPage || isRoot) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // const { pathname } = request.nextUrl;
  // const isRoot = pathname === "/";
  // const isAuthPage = pathname.startsWith("/signin");
  // const cookieAuthed = request.cookies.get("authjs.session-token");

  // if (isRoot) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  // if (isAuthPage) {
  //   if (cookieAuthed) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   } else if (!cookieAuthed) {
  //     return NextResponse.redirect(new URL("/signin", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
