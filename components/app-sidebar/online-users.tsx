"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarGroup,
	SidebarGroupLabel,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePresence } from "@/hooks/use-presence";

export const OnlineUsers = () => {
	const { onlineUsers } = usePresence();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	if (onlineUsers.length === 0) return null;

	return (
		<SidebarGroup className="py-0">
			<SidebarGroupLabel className="text-xs">
				オンライン ({onlineUsers.length})
			</SidebarGroupLabel>
			<div className={isCollapsed ? "flex flex-col items-center gap-1 px-1" : "flex flex-wrap gap-1.5 px-2 pb-1"}>
				{onlineUsers.map((user) => (
					<Tooltip key={user.id}>
						<TooltipTrigger asChild>
							<div className="relative">
								<Avatar className="h-7 w-7 border-2 border-background">
									<AvatarImage src={user.image} alt={user.name} />
									<AvatarFallback className="text-[10px]">
										{user.name.slice(0, 2)}
									</AvatarFallback>
								</Avatar>
								<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" className="text-xs">
							{user.name}
						</TooltipContent>
					</Tooltip>
				))}
			</div>
		</SidebarGroup>
	);
};
