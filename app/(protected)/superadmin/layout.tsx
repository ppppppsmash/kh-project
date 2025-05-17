"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-sidebar/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toast } from "@/components/ui/toast";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<AppHeader />
					<div className="flex flex-1 flex-col">
						<div className="flex-1 px-4 lg:px-6 py-4">
							{children}
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
			<Toast />
		</>
	);
}
