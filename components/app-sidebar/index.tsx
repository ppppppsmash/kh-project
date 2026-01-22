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
import Image from "next/image";

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
							<a className="flex items-center justify-start rounded-md" href="/admin/dashboard">
								<Image className="rounded-md" src="https://avatars.slack-edge.com/2025-06-02/9008372455248_bec518e5c0466e3a02fe_88.png" alt="logo" width={32} height={32} />
								<span className="text-sm font-medium">ADiXi MGR</span>
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
