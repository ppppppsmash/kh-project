"use client";

import { signIn } from "next-auth/react";
import { InteractiveHoverButton } from "@/components/animation-ui/active-hover-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { SigninBackground } from "./_components/signin-background";
import { TextHoverEffect } from "@/components/animation-ui/text-hover-effect";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="h-[20rem] flex items-center justify-center z-50">
        <TextHoverEffect text="ADiXi" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <InteractiveHoverButton
          onClick={() => signIn("google")}
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
