import { ModeToggle } from "@/components/app-sidebar/mode-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navConfig } from "@/config";
import { usePathname } from "next/navigation";

const getBreadcrumbs = (
	navItems: typeof navConfig.navMain,
	pathname: string,
) => {
	for (const item of navItems) {
		if (item.url === pathname) {
			return [item];
		}
		if (item.items) {
			const child = item.items.find((sub) => sub.url === pathname);
			if (child) {
				return [item, child];
			}
		}
	}
	return [];
};

export const AppHeader = () => {
	const pathname = usePathname();
	const breadcrumbs = getBreadcrumbs(navConfig.navMain, pathname);

	return (
		<header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>

				{/* breadcrumb area */}
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((crumb, index) => (
							<div key={crumb.url} className="flex items-center gap-2">
								<BreadcrumbItem
									className={
										index === breadcrumbs.length - 1 ? "" : "hidden md:block"
									}
								>
									<BreadcrumbPage>{crumb.title}</BreadcrumbPage>
								</BreadcrumbItem>
								{index !== breadcrumbs.length - 1 && (
									<BreadcrumbSeparator className="hidden md:block" />
								)}
							</div>
						))}
					</BreadcrumbList>
				</Breadcrumb>
				<div className="ml-auto flex items-center gap-2">
					<ThemeSelector />
					<ModeToggle />
				</div>
			</div>
		</header>
	);
};
