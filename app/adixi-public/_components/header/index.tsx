"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/app-sidebar/mode-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    const callbackUrl = "/signin";
    signOut({ callbackUrl });
  };

  const isSuperAdmin = session?.user?.role === "superadmin";

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-background">
      <header className="py-2 px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Link href="/">ADiXi MGR</Link>
        </h1>
        <div className="p-4 flex items-center gap-4">
          <ModeToggle />
          {session && (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="flex flex-col gap-2">
                  {isSuperAdmin && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => router.push("/superadmin/dashboard")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      管理者画面
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="justify-start text-red-500 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>
    </div>
  );
};
