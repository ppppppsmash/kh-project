"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { externalNavConfig } from "@/config";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export const Sidebar = () => {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="fixed top-16 h-screen space-y-4 flex flex-col">
      <div className="px-3 py-2">
        <div className="space-y-1 relative">
          {externalNavConfig.map((route, index) => (
            <Link
              key={route.url}
              href={route.url}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition dark:text-white relative",
                pathname === route.url ? "text-gray-900 dark:text-black" : "text-gray-600"
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center flex-1 relative z-10">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.url ? "text-gray-900" : "text-gray-500")} />
                {route.title}
              </div>
              <AnimatePresence>
                {(hoveredIndex === index || pathname === route.url) && (
                  <motion.div
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    layoutId="hoverBackground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}; 