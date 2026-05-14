"use client";

import { checkMyApproval } from "@/actions/user";
import { InteractiveHoverButton } from "@/components/animation-ui/active-hover-button";
import { TextHoverEffect } from "@/components/animation-ui/text-hover-effect";
import { signIn, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 5000;

export default function PendingPage() {
	const redirecting = useRef(false);

	useEffect(() => {
		const tick = async () => {
			if (redirecting.current) return;
			try {
				const status = await checkMyApproval();
				// 却下されて DB から削除された場合
				if (status === null) {
					redirecting.current = true;
					await signOut({ callbackUrl: "/signin" });
					return;
				}
				if (status?.isActive) {
					redirecting.current = true;
					// 古い JWT を捨てて再ログイン（Google は既ログインなので一瞬で戻る）
					const callbackUrl =
						status.role === "superadmin"
							? "/superadmin/dashboard"
							: "/adixi-public/qa";
					await signIn("google", { callbackUrl });
				}
			} catch (e) {
				console.error("approval poll failed:", e);
			}
		};
		tick(); // 初回即実行
		const id = setInterval(tick, POLL_INTERVAL_MS);
		return () => clearInterval(id);
	}, []);

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/signin" });
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
			<div className="w-full h-[16rem] flex items-center justify-center z-50">
				<TextHoverEffect text="ADiXi" />
			</div>
			<div className="flex flex-col items-center gap-6 text-center">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">承認待ちです</h1>
					<p className="text-sm text-muted-foreground max-w-md">
						アカウントが作成されました。管理者の承認が完了するまでお待ちください。
						承認されると自動的に画面が切り替わります。
					</p>
				</div>
				<InteractiveHoverButton
					onClick={handleSignOut}
					className="flex items-center justify-center"
				>
					サインアウト
				</InteractiveHoverButton>
			</div>
		</div>
	);
}
