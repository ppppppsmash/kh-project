"use client";

import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { OrganizationChart, OrganizationChartStyles } from "@/components/organization-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";
import { navConfig } from "@/config";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { 
	Users, 
	Building, 
	User, 
	Mail, 
	Calendar,
	Filter,
	RefreshCw
} from "lucide-react";
import type { MemberFormValues } from "@/lib/validations";

interface OrganizationMember {
	id: string;
	name: string;
	position: "manager" | "leader" | "specialist" | "member";
	department: "application" | "cloud";
	email: string;
	skills: string[];
	joinDate: string;
	avatar?: string;
	children?: OrganizationMember[];
}

export default function OrganizationPage() {
	const { data: session } = useSession();
	const { data: users, isLoading } = useGetUserList();
	const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
	const [selectedPosition, setSelectedPosition] = useState<string>("all");

	// 部署とポジションのフィルターオプション
	const departments = useMemo(() => {
		const deps = Array.from(new Set(users?.map(user => user.department).filter(Boolean)));
		return ["全て", ...deps];
	}, [users]);

	const positions = useMemo(() => {
		const pos = Array.from(new Set(users?.map(user => user.position).filter(Boolean)));
		return ["全て", ...pos];
	}, [users]);

	// 組織図データの構築
	const organizationData = useMemo(() => {
		// ポジションタイプの判定
		const getPositionType = (position: string): "manager" | "leader" | "specialist" | "member" => {
			const pos = position.toLowerCase();
			if (pos.includes("manager") || pos.includes("マネージャー")) return "manager";
			if (pos.includes("leader") || pos.includes("リーダー")) return "leader";
			if (pos.includes("specialist") || pos.includes("スペシャリスト")) return "specialist";
			return "member";
		};

		// 部署タイプの判定
		const getDepartmentType = (department: string): "application" | "cloud" => {
			const dept = department.toLowerCase();
			if (dept.includes("cloud") || dept.includes("クラウド")) return "cloud";
			return "application";
		};

		if (!users) return null;

		// フィルタリング
		const filteredUsers = users.filter(user => {
			const deptMatch = selectedDepartment === "all" || user.department === selectedDepartment;
			const posMatch = selectedPosition === "all" || user.position === selectedPosition;
			return deptMatch && posMatch;
		});

		// ポジションに基づいて階層構造を構築
		const managers = filteredUsers.filter(user => 
			user.position?.toLowerCase().includes("manager") || 
			user.position?.toLowerCase().includes("マネージャー")
		);

		const leaders = filteredUsers.filter(user => 
			user.position?.toLowerCase().includes("leader") || 
			user.position?.toLowerCase().includes("リーダー")
		);

		const specialists = filteredUsers.filter(user => 
			user.position?.toLowerCase().includes("specialist") || 
			user.position?.toLowerCase().includes("スペシャリスト")
		);

		const members = filteredUsers.filter(user => 
			!user.position?.toLowerCase().includes("manager") &&
			!user.position?.toLowerCase().includes("leader") &&
			!user.position?.toLowerCase().includes("specialist") &&
			!user.position?.toLowerCase().includes("マネージャー") &&
			!user.position?.toLowerCase().includes("リーダー") &&
			!user.position?.toLowerCase().includes("スペシャリスト")
		);

		// 組織図のルートノード（最初のマネージャーまたはリーダー）
		const rootUser = managers[0] || leaders[0] || specialists[0] || members[0];
		
		if (!rootUser) return null;

		const mapUserToOrgMember = (user: MemberFormValues): OrganizationMember => ({
			id: user.id || "",
			name: user.name || "",
			position: getPositionType(user.position || ""),
			department: getDepartmentType(user.department || ""),
			email: user.email || "",
			skills: Array.isArray(user.skills) ? user.skills : [],
			joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString("ja-JP") : "",
			avatar: user.photoUrl || "",
		});

		const rootMember = mapUserToOrgMember(rootUser);
		
		// 子ノードを追加
		const children: OrganizationMember[] = [];
		
		// リーダーを子として追加
		for (const leader of leaders) {
			if (leader.id !== rootUser.id) {
				const leaderMember = mapUserToOrgMember(leader);
				// メンバーをリーダーの子として追加
				const leaderChildren = members.filter(member => 
					member.department === leader.department
				).map(mapUserToOrgMember);
				leaderMember.children = leaderChildren;
				children.push(leaderMember);
			}
		}

		// スペシャリストを子として追加
		for (const specialist of specialists) {
			if (specialist.id !== rootUser.id) {
				children.push(mapUserToOrgMember(specialist));
			}
		}

		// 残りのメンバーを子として追加
		for (const member of members) {
			if (member.id !== rootUser.id && 
				!leaders.some(leader => leader.id === member.id) &&
				!specialists.some(spec => spec.id === member.id)) {
				children.push(mapUserToOrgMember(member));
			}
		}

		rootMember.children = children;
		return rootMember;
	}, [users, selectedDepartment, selectedPosition]);

	// 統計情報
	const stats = useMemo(() => {
		if (!users) return null;
		
		const totalUsers = users.length;
		const activeUsers = users.filter(user => user.isActive).length;
		const departments = Array.from(new Set(users.map(user => user.department).filter(Boolean)));
		const positions = Array.from(new Set(users.map(user => user.position).filter(Boolean)));

		return {
			totalUsers,
			activeUsers,
			departments: departments.length,
			positions: positions.length
		};
	}, [users]);

	const handleMemberClick = (member: OrganizationMember) => {
		console.log("Selected member:", member);
		// ここでモーダルを開くなどの処理を追加できます
	};

	const handleRefresh = () => {
		window.location.reload();
	};

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
				<Button onClick={handleRefresh} variant="outline" size="sm">
					<RefreshCw className="h-4 w-4 mr-2" />
					更新
				</Button>
			</div>

			{/* 統計カード */}
			{stats && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalUsers}</div>
							<p className="text-xs text-muted-foreground">
								アクティブ: {stats.activeUsers}人
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">部署数</CardTitle>
							<Building className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.departments}</div>
							<p className="text-xs text-muted-foreground">
								組織単位
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">役職数</CardTitle>
							<User className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.positions}</div>
							<p className="text-xs text-muted-foreground">
								職位区分
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">最終更新</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{new Date().toLocaleDateString("ja-JP")}
							</div>
							<p className="text-xs text-muted-foreground">
								リアルタイム
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* フィルター */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						フィルター
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2">
							<Building className="h-4 w-4 text-muted-foreground" />
							<select
								value={selectedDepartment}
								onChange={(e) => setSelectedDepartment(e.target.value)}
								className="px-3 py-2 border rounded-md text-sm"
							>
								{departments.map(dept => (
									<option key={dept} value={dept === "全て" ? "all" : dept}>
										{dept}
									</option>
								))}
							</select>
						</div>
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<select
								value={selectedPosition}
								onChange={(e) => setSelectedPosition(e.target.value)}
								className="px-3 py-2 border rounded-md text-sm"
							>
								{positions.map(pos => (
									<option key={pos} value={pos === "全て" ? "all" : pos}>
										{pos}
									</option>
								))}
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 組織図 */}
			<Card>
				<CardHeader>
					<CardTitle>組織図</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-64 w-full" />
						</div>
					) : organizationData ? (
						<div className="relative">
							<OrganizationChart
								data={organizationData}
								onMemberClick={handleMemberClick}
								className="min-h-[600px]"
							/>
							<OrganizationChartStyles />
						</div>
					) : (
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">
								組織データが見つかりません
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
