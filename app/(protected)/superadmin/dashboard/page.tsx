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
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";
import { navConfig } from "@/config";

export default function DashboardPage() {
	const { data: session } = useSession();
	const { data: userActivity, isLoading: isUserActivityLoading } =
		useGetUserActivity();
	const { data: clubs } = useGetClubActivities();
	const { taskStats, isLoading: isTaskStatsLoading } = useGetTaskStats();

	const getStatusCount = (status: ClubFormValues["status"]) => {
		return clubs?.filter((club) => club.status === status).length ?? 0;
	};

	if (isUserActivityLoading || isTaskStatsLoading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-3xl font-bold">
						<PointerHighlight
							rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
							pointerClassName="text-purple-500"
						>
							<span className="relative z-10">{navConfig.navMain[0].title}</span>
						</PointerHighlight>
					</h2>
					<div className="text-sm text-muted-foreground">
						<Skeleton className="w-24 h-4" />
						<Skeleton className="w-24 h-4" />
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
					<Skeleton className="w-full h-8" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{navConfig.navMain[0].title}</span>
					</PointerHighlight>
				</h2>
				<div className="text-sm text-muted-foreground">
					ようこそ、{session?.user?.name}さん
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<h3 className="text-lg font-bold">ユーザ操作履歴</h3>
				<div className="flex flex-col gap-2">
					{userActivity?.map((activity) => (
						<div key={activity.id} className="flex items-center gap-4 text-sm">
							<div className="flex gap-4 items-center justify-between w-full">
								<p className="flex items-center gap-1">
									<User className="h-4 w-4 text-muted-foreground" />
									<span className="font-bold">{activity.userName}</span>
									<span className="text-muted-foreground ml-4">
										{activity.action === "login" ? "ログイン" : "ログアウト"}
									</span>
								</p>
							</div>
							<p className="text-muted-foreground text-xs text-nowrap">
								{activity.createdAt?.toLocaleString()}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-bold">タスク状況</h3>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">タスク数</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{taskStats.totalTasks}件
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">進行中</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{taskStats.inProgressTasks}件
							</div>
						</CardContent>
					</Card>
					{/* <Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">本日登録数</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{taskStats.todayTasks}件
							</div>
						</CardContent>
					</Card> */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">完了数</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{taskStats.completedTasks}件
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-bold">部活動</h3>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">活動中</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{getStatusCount("active")}
							</div>
							<p className="text-xs text-muted-foreground">現在活動中</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">休止中</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{getStatusCount("inactive")}
							</div>
							<p className="text-xs text-muted-foreground">一時休止中</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">承認待ち</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{getStatusCount("pending")}
							</div>
							<p className="text-xs text-muted-foreground">承認待ち</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">総数</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{clubs?.length ?? 0}</div>
							<p className="text-xs text-muted-foreground">全部活動</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
