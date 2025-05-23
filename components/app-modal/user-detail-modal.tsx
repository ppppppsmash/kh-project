import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { MemberFormValues } from "@/lib/validations";

interface UserDetailModalProps {
	user: MemberFormValues | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UserDetailModal = ({
	user,
	isOpen,
	onClose,
}: UserDetailModalProps) => {
	if (!user) return null;

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
								{user.isActive ? "アクティブ" : "非アクティブ"}
							</p>
						</div>
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
