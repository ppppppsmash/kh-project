"use client";

import { approveUser, rejectUser } from "@/actions/user";
import { PageTitle } from "@/components/animation-ui/page-title";
import { useGetPendingUsers } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CustomToast } from "@/components/ui/toast";
import type { MemberFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

type ApprovableRole = "admin" | "superadmin";

export default function PendingMembersPage() {
	const { data: users, isLoading } = useGetPendingUsers();
	const queryClient = useQueryClient();
	const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
	const [rolesById, setRolesById] = useState<Record<string, ApprovableRole>>(
		{},
	);

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["pending-users"] });
		queryClient.invalidateQueries({ queryKey: ["users"] });
	};

	const handleApprove = async (user: MemberFormValues) => {
		if (!user.id) return;
		setPendingIds((p) => ({ ...p, [user.id as string]: true }));
		try {
			const role = rolesById[user.id] ?? "admin";
			await approveUser(user.id, role);
			CustomToast.success(`${user.name ?? "ユーザ"}を承認しました`);
			invalidate();
		} catch (e) {
			console.error(e);
			CustomToast.error("承認に失敗しました");
		} finally {
			setPendingIds((p) => ({ ...p, [user.id as string]: false }));
		}
	};

	const handleReject = async (user: MemberFormValues) => {
		if (!user.id) return;
		if (!confirm(`${user.name ?? "このユーザ"}を却下しますか？`)) return;
		setPendingIds((p) => ({ ...p, [user.id as string]: true }));
		try {
			await rejectUser(user.id);
			CustomToast.success(`${user.name ?? "ユーザ"}を却下しました`);
			invalidate();
		} catch (e) {
			console.error(e);
			CustomToast.error("却下に失敗しました");
		} finally {
			setPendingIds((p) => ({ ...p, [user.id as string]: false }));
		}
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-6">
				<PageTitle>承認待ちユーザ</PageTitle>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">読み込み中...</p>
			) : !users || users.length === 0 ? (
				<div className="rounded-lg border border-dashed p-8 text-center">
					<p className="text-sm text-muted-foreground">
						承認待ちのユーザはいません
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{users.map((user) => {
						const id = user.id as string;
						const role = rolesById[id] ?? "admin";
						const busy = pendingIds[id];
						return (
							<div
								key={id}
								className="flex items-center gap-4 rounded-lg border p-4"
							>
								{user.photoUrl ? (
									<Image
										src={user.photoUrl}
										alt={user.name ?? ""}
										width={48}
										height={48}
										className="rounded-full object-cover"
									/>
								) : (
									<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs">
										No Img
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{user.name}</p>
									<p className="text-xs text-muted-foreground truncate">
										{user.email}
									</p>
								</div>
								<Select
									value={role}
									onValueChange={(v) =>
										setRolesById((prev) => ({
											...prev,
											[id]: v as ApprovableRole,
										}))
									}
								>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="admin">admin</SelectItem>
										<SelectItem value="superadmin">superadmin</SelectItem>
									</SelectContent>
								</Select>
								<Button
									size="sm"
									onClick={() => handleApprove(user)}
									disabled={busy}
								>
									{busy ? "..." : "承認"}
								</Button>
								<Button
									size="sm"
									variant="destructive"
									onClick={() => handleReject(user)}
									disabled={busy}
								>
									却下
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
