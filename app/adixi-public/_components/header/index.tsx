"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/app-sidebar/mode-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  type: "external" | "adixi-public";
}

export const Header = ({ type }: HeaderProps) => {
  const handleSignOut = () => {
    const callbackUrl = type === "external" ? "/external/qa" : "/adixi-public/qa";
    signOut({ callbackUrl });
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-background">
      <header className="py-2 px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Link href="/">ADiXi MGR</Link>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </header>
    </div>
  );
};
