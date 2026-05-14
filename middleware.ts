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
	const isPendingPage = request.nextUrl.pathname === "/pending";
	const isSuperAdminPage = request.nextUrl.pathname.startsWith("/superadmin");
	const isAdixiPublicPage =
		request.nextUrl.pathname.startsWith("/adixi-public");
	const isExternalPage = request.nextUrl.pathname.startsWith("/external");
	const isSharePage = request.nextUrl.pathname.startsWith("/share");

	// /share/* はBasic認証で保護（社外向けアジェンダ共有ページ）
	if (isSharePage) {
		const expectedUser = process.env.SHARE_BASIC_AUTH_USER;
		const expectedPassword = process.env.SHARE_BASIC_AUTH_PASSWORD;

		if (expectedUser && expectedPassword) {
			const authHeader = request.headers.get("authorization");
			const unauthorized = new NextResponse("Authentication required", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="Share", charset="UTF-8"',
				},
			});

			if (!authHeader?.startsWith("Basic ")) {
				return unauthorized;
			}

			let decoded: string;
			try {
				decoded = atob(authHeader.slice("Basic ".length));
			} catch {
				return unauthorized;
			}

			const separatorIndex = decoded.indexOf(":");
			if (separatorIndex === -1) {
				return unauthorized;
			}
			const inputUser = decoded.slice(0, separatorIndex);
			const inputPassword = decoded.slice(separatorIndex + 1);

			if (inputUser !== expectedUser || inputPassword !== expectedPassword) {
				return unauthorized;
			}
		}

		return NextResponse.next();
	}

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

	// 承認待ちユーザは /pending のみアクセス可能
	// 既存トークン互換: isActive が undefined のときは active 扱い
	if (mySession?.user && mySession.user.isActive === false) {
		if (isPendingPage) {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/pending", request.url));
	}

	// 承認済みユーザが /pending に来たらロール別ホームへ
	if (isPendingPage) {
		const role = mySession?.user?.role;
		if (role === "superadmin") {
			return NextResponse.redirect(
				new URL("/superadmin/dashboard", request.url),
			);
		}
		if (role === "admin") {
			return NextResponse.redirect(new URL("/adixi-public/qa", request.url));
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
