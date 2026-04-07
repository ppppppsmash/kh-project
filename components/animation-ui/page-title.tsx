"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
	children: React.ReactNode;
	className?: string;
}

export const PageTitle = ({ children, className }: PageTitleProps) => {
	return (
		<div className={cn("relative inline-block overflow-hidden", className)}>
			{/* テキスト: クリップマスクで左から露出 */}
			<motion.h2
				className="text-3xl font-bold"
				initial={{ clipPath: "inset(0 100% 0 0)" }}
				animate={{ clipPath: "inset(0 0% 0 0)" }}
				transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
			>
				{children}
			</motion.h2>

			{/* 下線: 左からスライドイン */}
			<motion.div
				className="h-px bg-foreground/25 mt-1"
				initial={{ scaleX: 0, transformOrigin: "left" }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
			/>
		</div>
	);
};
