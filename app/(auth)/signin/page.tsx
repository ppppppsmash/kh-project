"use client";

import { useSession, signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { InteractiveHoverButton } from "@/components/animation-ui/active-hover-button";
import { Icons } from "@/components/ui/icons";
import { SigninBackground } from "./_components/signin-background";
import { TextHoverEffect } from "@/components/animation-ui/text-hover-effect";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const handleSignIn = async () => {
    if (role === "superadmin") {
      await signIn("google", { callbackUrl: "/superadmin/dashboard" });
    } else {
      await signIn("google", { callbackUrl: "/adixi-public/qa" });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 animate-gradient bg-gradient-to-b from-blue-400 to-purple-400">
      <div className="w-full h-[16rem] flex items-center justify-center z-50">
        {role === "superadmin" ? (
          <TextHoverEffect text="ADiXi MGR" />
        ) : (
          <TextHoverEffect text="ADiXi LDR" />
        )}
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
};
