import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
	const session = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
		secureCookie: process.env.NODE_ENV === "production",
	});

	const mySession = await auth();
	const isRoot = request.nextUrl.pathname === "/";
	const isSigninPage = request.nextUrl.pathname === "/signin";
	const isSuperAdminPage = request.nextUrl.pathname.startsWith("/superadmin");
	const isAdixiPublicPage =
		request.nextUrl.pathname.startsWith("/adixi-public");
	const isExternalPage = request.nextUrl.pathname.startsWith("/external");

	// ルートページは外部QAページにリダイレクト
	if (isRoot) {
		return NextResponse.redirect(new URL("/external/qa", request.url));
	}

	// 未ログインの場合、サインインページにリダイレクト
	if (!session) {
		if (isSigninPage) {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/signin", request.url));
	}

	// ログイン済みの場合、ロールに基づいてアクセス制御
	if (session && mySession?.user) {
		const role = mySession.user.role;

		// superadminの場合
		if (role === "superadmin") {
			if (isSigninPage) {
				return NextResponse.redirect(
					new URL("/superadmin/dashboard", request.url),
				);
			}
			if (isSuperAdminPage) {
				return NextResponse.next();
			}
			if (isAdixiPublicPage || isExternalPage) {
				return NextResponse.next();
			}
			return NextResponse.redirect(
				new URL("/superadmin/dashboard", request.url),
			);
		}

		// adminの場合
		if (role === "admin") {
			if (isSigninPage) {
				return NextResponse.redirect(new URL("/adixi-public/qa", request.url));
			}
			if (isSuperAdminPage) {
				return NextResponse.redirect(new URL("/adixi-public/qa", request.url));
			}
			if (isAdixiPublicPage || isExternalPage) {
				return NextResponse.next();
			}
			return NextResponse.redirect(new URL("/adixi-public/qa", request.url));
		}

		// その他のユーザー
		return NextResponse.redirect(new URL("/signin", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
