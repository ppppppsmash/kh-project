"use client";

import { Mail } from "lucide-react";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/active-hover-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">KANGEN Holdings</CardTitle>
          <CardDescription className="text-center">マネジメントシステム</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <InteractiveHoverButton
              onClick={() => signIn("google")}
            >
              {/* <Mail className="mr-2 h-4 w-4" /> */}
              Googleサインイン
            </InteractiveHoverButton>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-xs">
            自社メールアドレスでログインしてください.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
