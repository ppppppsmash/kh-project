"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { externalNavConfig } from "@/config";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {externalNavConfig.map((route) => (
            <Link
              key={route.url}
              href={route.url}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition",
                pathname === route.url ? "bg-gray-100" : "text-gray-600"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.url ? "text-gray-900" : "text-gray-500")} />
                {route.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}; 