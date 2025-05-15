"use client";

import { InteractiveHoverButton } from "@/components/animation-ui/active-hover-button";
import { TextHoverEffect } from "@/components/animation-ui/text-hover-effect";
import { Icons } from "@/components/ui/icons";
import { signIn } from "next-auth/react";
import { SigninBackground } from "./_components/signin-background";

export default function LoginPage() {
	const handleSignIn = async () => {
		await signIn("google");
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center p-4 animate-gradient bg-gradient-to-b from-blue-400 to-purple-400">
			<div className="w-full h-[16rem] flex items-center justify-center z-50">
				<TextHoverEffect text="ADiXi" />
			</div>
			<div className="flex flex-col items-center gap-4">
				<InteractiveHoverButton
					onClick={handleSignIn}
					className="flex items-center justify-center"
				>
					<Icons.google className="h-4 w-4" />
					サインイン
				</InteractiveHoverButton>
			</div>

			<SigninBackground />
		</div>
	);
}
