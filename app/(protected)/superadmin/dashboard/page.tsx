"use client";

import {
	useGetUserActivity,
	useGetTaskStats,
} from "@/components/app-table/hooks/use-table-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Activity,
	User,
	FileText,
	HelpCircle,
	Building,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getNavTitle } from "@/config";
import { PageTitle } from "@/components/animation-ui/page-title";
import { motion } from "motion/react";

export default function DashboardPage() {
	const { data: session } = useSession();
	const { data: userActivity, isLoading: isUserActivityLoading } =
		useGetUserActivity();
	const { taskStats, isLoading: isTaskStatsLoading } = useGetTaskStats();

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

	// フィールド名を日本語に変換する関数
	const getFieldDisplayName = (fieldName: string): string => {
		const fieldNames: Record<string, string> = {
			title: "タイトル",
			content: "内容",
			assignee: "担当者",
			dueDate: "期限日",
			progress: "進捗",
			priority: "優先度",
			progressDetails: "進捗詳細",
			notes: "備考",
			link: "リンク",
			categoryId: "カテゴリ",
			tabId: "タブ",
			startedAt: "開始日",
			completedAt: "完了日",
			question: "質問",
			answer: "回答",
			questionCode: "質問コード",
			category: "カテゴリ",
			isPublic: "公開設定",
			questionBy: "質問者",
			answeredBy: "回答者",
			name: "名前",
			email: "メールアドレス",
			role: "役割",
			department: "部署",
			position: "役職",
			skills: "スキル",
			hobby: "趣味",
			freeText: "自由記述",
			description: "説明",
			leader: "リーダー",
			memberCount: "メンバー数",
			activityType: "活動タイプ",
			status: "ステータス",
			location: "場所",
			detail: "詳細"
		};
		return fieldNames[fieldName] || fieldName;
	};

	// 値を読みやすい形式にフォーマットする関数
	const formatValue = (value: unknown): string => {
		if (value === null || value === undefined) {
			return "未設定";
		}
		if (typeof value === "boolean") {
			return value ? "はい" : "いいえ";
		}
		if (value instanceof Date) {
			return value.toLocaleDateString("ja-JP");
		}
		if (typeof value === "string") {
			// 進捗や優先度などの列挙値を日本語に変換
			const enumValues: Record<string, string> = {
				pending: "未着手",
				inProgress: "進行中",
				completed: "完了",
				high: "高",
				medium: "中",
				low: "低",
				none: "未設定",
				active: "アクティブ",
				inactive: "非アクティブ",
				superadmin: "スーパー管理者",
				admin: "管理者",
				user: "ユーザー"
			};
			return enumValues[value] || value;
		}
		if (Array.isArray(value)) {
			return value.join(", ");
		}
		return String(value);
	};

	if (isUserActivityLoading || isTaskStatsLoading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-between items-center mb-6">
					<PageTitle>{getNavTitle("/superadmin/dashboard")}</PageTitle>
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
				<PageTitle>{getNavTitle("/superadmin/dashboard")}</PageTitle>
				<div className="text-sm text-muted-foreground">
					ようこそ、{session?.user?.name}さん
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<h3 className="text-lg font-bold">操作履歴</h3>
				<div className="flex flex-col gap-2 max-h-[40svh] overflow-y-auto">
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
													<div>
														<div className="font-medium mb-2">変更詳細</div>
														<div className="mt-1">
															{(() => {
																try {
																	const details = JSON.parse(activity.resourceDetails);
																	if (details.oldData && details.newData) {
																		// 変更前後の比較表示をテキスト形式で
																		const changes: Array<{fieldName: string, oldValue: string | null | undefined, newValue: string | null | undefined, type: 'create' | 'delete' | 'update'}> = [];
																		
																		// 各フィールドの変更をチェック
																		for (const key of Object.keys(details.newData)) {
																			const oldValue = details.oldData[key];
																			const newValue = details.newData[key];
																			
																			if (oldValue !== newValue) {
																				// フィールド名を日本語に変換
																				const fieldName = getFieldDisplayName(key);
																				
																				if (oldValue === null || oldValue === undefined) {
																					changes.push({fieldName, oldValue, newValue, type: 'create'});
																				} else if (newValue === null || newValue === undefined) {
																					changes.push({fieldName, oldValue, newValue, type: 'delete'});
																				} else {
																					changes.push({fieldName, oldValue, newValue, type: 'update'});
																				}
																			}
																		}
																		
																		return changes.length > 0 ? (
																			<div className="space-y-1.5">
																				{changes.map((change, index) => (
																					<motion.div
																						key={`change-${change.fieldName}-${index}`}
																						className="flex items-baseline gap-2 leading-relaxed flex-wrap"
																						initial={{ opacity: 0, x: -8 }}
																						animate={{ opacity: 1, x: 0 }}
																						transition={{ duration: 0.25, delay: index * 0.05 }}
																					>
																						<span className="text-muted-foreground shrink-0">{change.fieldName}:</span>
																						{change.type === 'create' && (
																							<span className="bg-foreground/5 text-foreground px-1.5 py-0.5 rounded text-xs font-medium break-all">
																								+ {formatValue(change.newValue)}
																							</span>
																						)}
																						{change.type === 'delete' && (
																							<span className="bg-foreground/5 text-muted-foreground px-1.5 py-0.5 rounded text-xs line-through break-all">
																								{formatValue(change.oldValue)}
																							</span>
																						)}
																						{change.type === 'update' && (
																							<span className="inline-flex items-center gap-1.5 flex-wrap">
																								<span className="bg-foreground/5 text-muted-foreground px-1.5 py-0.5 rounded text-xs line-through break-all">
																									{formatValue(change.oldValue)}
																								</span>
																								<span className="text-muted-foreground">→</span>
																								<span className="bg-foreground/5 text-foreground px-1.5 py-0.5 rounded text-xs font-medium break-all">
																									{formatValue(change.newValue)}
																								</span>
																							</span>
																						)}
																					</motion.div>
																				))}
																			</div>
																		) : (
																			<span className="text-muted-foreground">変更はありません</span>
																		);
																	}
																	// 単一の詳細情報表示（作成・削除時）
																	return (
																		<div className="space-y-1 text-xs">
																			{Object.entries(details).map(([key, value]) => {
																				const fieldName = getFieldDisplayName(key);
																				return (
																					<div key={key} className="flex items-center gap-2">
																						<span className="text-muted-foreground">•</span>
																						<span>{fieldName}: {formatValue(value)}</span>
																					</div>
																				);
																			})}
																		</div>
																	);
																} catch (error) {
																	return (
																		<div className="text-red-600 text-xs">
																			データの解析に失敗しました
																		</div>
																	);
																}
															})()}
														</div>
													</div>
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

			<div className="space-y-3">
				<div className="flex items-baseline justify-between">
					<h3 className="text-lg font-bold">タスク状況</h3>
					<span className="text-xs text-muted-foreground tabular-nums">
						全 {taskStats.totalTasks} 件
					</span>
				</div>
				<div className="rounded-lg border divide-y">
					{[
						{
							label: "未着手",
							count: taskStats.totalTasks - taskStats.inProgressTasks - taskStats.completedTasks,
							bar: "bg-foreground/15",
							dot: "bg-foreground/30",
						},
						{
							label: "進行中",
							count: taskStats.inProgressTasks,
							bar: "bg-foreground/35",
							dot: "bg-foreground/55",
						},
						{
							label: "完了",
							count: taskStats.completedTasks,
							bar: "bg-foreground/60",
							dot: "bg-foreground/80",
						},
					].map((row, i) => {
						const pct = taskStats.totalTasks > 0
							? Math.round((row.count / taskStats.totalTasks) * 100)
							: 0;
						return (
							<motion.div
								key={row.label}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: i * 0.1 }}
								className="flex items-center gap-3 px-4 py-2.5"
							>
								<span className={`h-2 w-2 shrink-0 rounded-full ${row.dot}`} />
								<span className="text-sm w-16">{row.label}</span>
								<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
									<motion.div
										className={`h-full rounded-full ${row.bar}`}
										initial={{ width: 0 }}
										animate={{ width: `${pct}%` }}
										transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: "easeOut" }}
									/>
								</div>
								<span className="text-sm tabular-nums w-8 text-right">{row.count}</span>
								<span className="text-xs tabular-nums text-muted-foreground w-10 text-right">{pct}%</span>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
