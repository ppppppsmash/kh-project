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
	User,
	FileText,
	HelpCircle,
	Building,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { navConfig } from "@/config";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";

export default function DashboardPage() {
	const { data: session } = useSession();
	const { data: userActivity, isLoading: isUserActivityLoading } =
		useGetUserActivity();
	const { data: clubs } = useGetClubActivities();
	const { taskStats, isLoading: isTaskStatsLoading } = useGetTaskStats();

	const getStatusCount = (status: ClubFormValues["status"]) => {
		return clubs?.filter((club) => club.status === status).length ?? 0;
	};

	const getActionLabel = (action: string) => {
		switch (action) {
			case "login":
				return "ログイン";
			case "logout":
				return "ログアウト";
			case "task_create":
				return "タスク作成";
			case "task_update":
				return "タスク更新";
			case "task_delete":
				return "タスク削除";
			case "qa_create":
				return "QA作成";
			case "qa_update":
				return "QA更新";
			case "qa_delete":
				return "QA削除";
			case "member_create":
				return "メンバー作成";
			case "member_update":
				return "メンバー更新";
			case "member_delete":
				return "メンバー削除";
			case "club_create":
				return "部活動作成";
			case "club_update":
				return "部活動更新";
			case "club_delete":
				return "部活動削除";
			default:
				return action;
		}
	};

	const getResourceIcon = (resourceType: string | undefined) => {
		switch (resourceType) {
			case "task":
				return <FileText className="h-4 w-4" />;
			case "qa":
				return <HelpCircle className="h-4 w-4" />;
			case "member":
				return <User className="h-4 w-4" />;
			case "club":
				return <Building className="h-4 w-4" />;
			case "login":
			case "logout":
				return <Activity className="h-4 w-4" />;
			default:
				return <Activity className="h-4 w-4" />;
		}
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
						<div key={activity.id} className="flex items-start gap-4 text-sm p-3 bg-muted/30 rounded-lg">
							<div className="flex gap-4 items-start justify-between w-full">
								<div className="flex flex-col gap-1 flex-1">
									<div className="flex items-center gap-2">
										{getResourceIcon(activity.resourceType)}
										<span className="font-bold">{activity.userName}</span>
										<span className="text-muted-foreground">
											{getActionLabel(activity.action)}
										</span>
									</div>
									
									{/* 操作対象の詳細情報を表示 */}
									{activity.resourceType && activity.resourceType !== "login" && activity.resourceType !== "logout" && (
										<div className="ml-6 mt-1 text-xs">
											{activity.resourceName && (
												<div className="flex items-center gap-1 text-muted-foreground">
													<span>対象:</span>
													<span className="font-medium text-foreground">
														{activity.resourceName}
													</span>
												</div>
											)}
											{activity.resourceDetails && (
												<div className="mt-1 p-2 bg-background rounded border text-xs">
													<details className="cursor-pointer">
														<summary className="font-medium">変更詳細</summary>
														<div className="mt-1">
															{(() => {
																try {
																	const details = JSON.parse(activity.resourceDetails);
																	if (details.oldData && details.newData) {
																		// 変更前後の比較表示
																		return (
																			<div className="space-y-2">
																				<div>
																					<span className="font-medium text-red-600">変更前:</span>
																					<pre className="mt-1 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs overflow-x-auto">
																						{JSON.stringify(details.oldData, null, 2)}
																					</pre>
																				</div>
																				<div>
																					<span className="font-medium text-green-600">変更後:</span>
																					<pre className="mt-1 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs overflow-x-auto">
																						{JSON.stringify(details.newData, null, 2)}
																					</pre>
																				</div>
																			</div>
																		);
																	}
																	// 単一の詳細情報表示
																	return (
																		<pre className="whitespace-pre-wrap break-words overflow-x-auto">
																			{JSON.stringify(details, null, 2)}
																		</pre>
																	);
																} catch (error) {
																	return (
																		<div className="text-red-600">
																			データの解析に失敗しました: {activity.resourceDetails}
																		</div>
																	);
																}
															})()}
														</div>
													</details>
												</div>
											)}
										</div>
									)}
								</div>
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

			{/* <div className="space-y-4">
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
			</div> */}
		</div>
	);
}
