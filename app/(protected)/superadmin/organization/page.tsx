"use client";

import {
	useGetClubActivities,
	useGetUserActivity,
	useGetTaskStats,
} from "@/components/app-table/hooks/use-table-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClubFormValues } from "@/lib/validations";
import {
	Activity,
	BarChart3,
	Calendar,
	User,
	Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { navConfig } from "@/config";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";

export default function DashboardPage() {
	const { data: session } = useSession();

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{navConfig.navMain[1].title}</span>
					</PointerHighlight>
				</h2>
			</div>

			<div className="flex flex-col gap-2">
				
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-bold">...</h3>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-bold">...</h3>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					
				</div>
			</div>
		</div>
	);
}
