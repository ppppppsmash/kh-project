import { approveUser, rejectUser } from "@/actions/user";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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

interface UserDetailModalProps {
	user: MemberFormValues | null;
	isOpen: boolean;
	onClose: () => void;
}

type ApprovableRole = "admin" | "superadmin";

export const UserDetailModal = ({
	user,
	isOpen,
	onClose,
}: UserDetailModalProps) => {
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<ApprovableRole>("admin");
	const [isBusy, setIsBusy] = useState(false);

	if (!user) return null;

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["users"] });
		queryClient.invalidateQueries({ queryKey: ["pending-users"] });
	};

	const handleApprove = async () => {
		if (!user.id) return;
		setIsBusy(true);
		try {
			await approveUser(user.id, selectedRole);
			CustomToast.success(`${user.name ?? "ユーザ"}を承認しました`);
			invalidate();
			onClose();
		} catch (error) {
			console.error(error);
			CustomToast.error("承認に失敗しました");
		} finally {
			setIsBusy(false);
		}
	};

	const handleReject = async () => {
		if (!user.id) return;
		if (!confirm(`${user.name ?? "このユーザ"}を却下しますか？`)) return;
		setIsBusy(true);
		try {
			await rejectUser(user.id);
			CustomToast.success(`${user.name ?? "ユーザ"}を却下しました`);
			invalidate();
			onClose();
		} catch (error) {
			console.error(error);
			CustomToast.error("却下に失敗しました");
		} finally {
			setIsBusy(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] h-[80svh] overflow-hidden flex flex-col">
				<DialogHeader className="sticky top-0 bg-background pb-4 border-b">
					<DialogTitle>メンバー詳細</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4 overflow-y-auto">
					<div className="flex items-start gap-4">
						{user.photoUrl && user.name ? (
							<Image
								src={user.photoUrl}
								alt={user.name}
								width={300}
								height={300}
								className="rounded-lg object-cover"
							/>
						) : (
							<div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
								No Image
							</div>
						)}
						<div className="flex-1">
							<h3 className="text-lg font-semibold">{user?.name}</h3>
							<p className="text-sm text-muted-foreground">{user?.email}</p>
						</div>
					</div>
					<div className="grid space-y-4">
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">ロール</p>
							<p className="text-sm">{user.role || "未設定"}</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">ステータス</p>
							<p className="text-sm">
								{user.isActive ? "アクティブ" : "承認待ち"}
							</p>
						</div>
						{user.isActive === false && (
							<div className="grid grid-cols-2 gap-2 items-center rounded-md border border-dashed p-3">
								<p className="text-sm font-medium">承認 / 却下</p>
								<div className="flex items-center gap-2 flex-wrap">
									<Select
										value={selectedRole}
										onValueChange={(v) =>
											setSelectedRole(v as ApprovableRole)
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
										onClick={handleApprove}
										disabled={isBusy}
									>
										{isBusy ? "..." : "承認"}
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={handleReject}
										disabled={isBusy}
									>
										却下
									</Button>
								</div>
							</div>
						)}
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">部署</p>
							<p className="text-sm">{user?.department}</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">役職</p>
							<p className="text-sm">{user?.position}</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">趣味</p>
							<p className="text-sm">{user?.hobby || "未設定"}</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">言語</p>
							<p className="flex flex-wrap gap-x-4">
								{user?.skills &&
								user.skills.filter((skill) => skill && skill.trim() !== "")
									.length > 0 ? (
									user.skills
										.filter((skill) => skill && skill.trim() !== "")
										.map((skill, index) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											<Badge key={index} variant="outline" className="text-sm">
												{skill}
											</Badge>
										))
								) : (
									<span className="text-muted-foreground text-xs">未設定</span>
								)}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">得意な技術</p>
							<p className="text-sm whitespace-pre-wrap break-words">
								{user?.skills_message || "未設定"}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<p className="text-sm font-medium">自己紹介</p>
							<p className="text-sm">{user?.freeText || "未設定"}</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
