"use client";

import type * as React from "react";
import { NavMain } from "@/components/app-sidebar/nav-main";
// import { NavSecondary } from "@/components/app-sidebar/nav-secondary";
// import { NavDocuments } from "@/components/app-sidebar/nav-document";
import { NavUser } from "@/components/app-sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navConfig } from "@/config";
import { StarText } from "@/components/animation-ui/star-text";

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/admin/dashboard">
								<StarText className="py-6">
									ADiXi MGR
								</StarText>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navConfig.navMain} />
				{/* <NavDocuments items={navConfig.documents} /> */}
				{/* <NavSecondary items={navConfig.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
};
