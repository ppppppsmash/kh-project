"use client";

import { signIn } from "next-auth/react";
import { InteractiveHoverButton } from "@/components/animation-ui/active-hover-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { SigninBackground } from "./_components/signin-background";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ADiXi</CardTitle>
          <CardDescription className="text-center">マネジメントシステム</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <InteractiveHoverButton
              onClick={() => signIn("google")}
              className="flex items-center justify-center"
            >
              <Icons.google className="h-4 w-4" />
              サインイン
            </InteractiveHoverButton>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-xs">
            社内のメールアドレスでログインしてください.
          </div>
        </CardFooter>
      </Card>

      <SigninBackground />
    </div>
  );
};
