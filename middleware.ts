import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/signin");
  const isSharePage = request.nextUrl.pathname.startsWith("/external");

  if (isSharePage) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
