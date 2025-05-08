import Link from "next/link";
import { ModeToggle } from "@/components/app-sidebar/mode-toggle";

export const Header = () => {
  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-background">
      <header className="py-2 px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Link href="/">ADiXi MGR</Link>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>
    </div>
  );
};
