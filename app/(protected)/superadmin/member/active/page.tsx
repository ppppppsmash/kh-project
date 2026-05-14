"use client";

import { PageTitle } from "@/components/animation-ui/page-title";
import { useGetActiveUsers } from "@/components/app-table/hooks/use-table-data";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export default function ActiveMembersPage() {
	const { data: users, isLoading } = useGetActiveUsers();

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-6">
				<PageTitle>利用ユーザ一覧</PageTitle>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">読み込み中...</p>
			) : !users || users.length === 0 ? (
				<div className="rounded-lg border border-dashed p-8 text-center">
					<p className="text-sm text-muted-foreground">
						利用ユーザがいません
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{users.map((user) => {
						const id = user.id as string;
						return (
							<div
								key={id}
								className="flex items-center gap-4 rounded-lg border p-4"
							>
								<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
									<Mail className="h-5 w-5" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{user.name}</p>
									<p className="text-xs text-muted-foreground truncate">
										{user.email}
									</p>
								</div>
								{user.department && (
									<span className="text-xs text-muted-foreground hidden sm:inline">
										{user.department}
									</span>
								)}
								<Badge variant="outline">{user.role ?? "未設定"}</Badge>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
