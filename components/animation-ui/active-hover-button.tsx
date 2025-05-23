import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import React from "react";

interface InteractiveHoverButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const InteractiveHoverButton = React.forwardRef<
	HTMLButtonElement,
	InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
	return (
		<button
			ref={ref}
			className={cn(
				"group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-6 text-center font-semibold",
				className,
			)}
			{...props}
		>
			<div className="flex items-center gap-2">
				<div className="h-1 w-1 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8] animate-pulse" />
				<span className="flex items-center gap-x-2 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
					{children}
				</span>
			</div>
			<div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
				<span className="flex items-center justify-center gap-x-2 text-center">
					{children}
				</span>
				<ArrowRight className="h-3 w-3" />
			</div>
		</button>
	);
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
