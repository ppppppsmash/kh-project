"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { MemberFormValues } from "@/lib/validations";
import {
	BicepsFlexed,
	Briefcase,
	Building2,
	Calendar,
	Code2,
	Heart,
	Mail,
	MessageSquare,
} from "lucide-react";
import Image from "next/image";

interface UserDetailProps {
	user?: MemberFormValues;
}

export const UserDetail = ({ user }: UserDetailProps) => {
	return (
		<div className="max-w-full w-full">
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div className="grid md:grid-cols-2 gap-6 p-6">
						{/* 左側：プロフィール画像 */}
						<div className="flex flex-col items-center space-y-4">
							<div className="relative w-150 h-150 rounded-lg overflow-hidden">
								{user?.photoUrl ? (
									<Image
										src={user.photoUrl}
										alt={user.name || "プロフィール画像"}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										priority
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
										<span className="text-gray-400 text-lg">No Image</span>
									</div>
								)}
							</div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
								{user?.name}
							</h1>
						</div>

						{/* 右側：情報 */}
						<div className="space-y-4">
							{/* メールアドレス */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-gray-600">
									<Mail className="w-5 h-5" />
									<h3 className="font-medium">メールアドレス</h3>
								</div>
								<p className="text-lg">{user?.email || "未設定"}</p>
							</div>

							{/* 基本情報 */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-gray-600">
										<Building2 className="w-5 h-5" />
										<h3 className="font-medium">事業部</h3>
									</div>
									<p className="text-lg">{user?.department || "未設定"}</p>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-gray-600">
										<Briefcase className="w-5 h-5" />
										<h3 className="font-medium">役職</h3>
									</div>
									<p className="text-lg">{user?.position || "未設定"}</p>
								</div>
							</div>

							{/* 趣味・特技 */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-gray-600">
									<Heart className="w-5 h-5" />
									<h3 className="font-medium">趣味・特技</h3>
								</div>
								<p className="text-lg whitespace-pre-line p-4 rounded-lg bg-gray-50">
									{user?.hobby || "未設定"}
								</p>
							</div>

							{/* 言語スキル */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-gray-600">
									<Code2 className="w-5 h-5" />
									<h3 className="font-medium">言語</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{user?.skills &&
									user.skills.filter((skill) => skill && skill.trim() !== "")
										.length > 0 ? (
										user.skills
											.filter((skill) => skill && skill.trim() !== "")
											.map((skill, index) => (
												<Badge
													// biome-ignore lint/suspicious/noArrayIndexKey: <explanation></explanation>
													key={index}
													variant="outline"
													className="text-sm bg-gray-50"
												>
													{skill}
												</Badge>
											))
									) : (
										<span className="text-muted-foreground text-sm">
											未設定
										</span>
									)}
								</div>
							</div>

							{/* スキル */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-gray-600">
									<BicepsFlexed className="w-5 h-5" />
									<h3 className="font-medium">得意な技術・スキル</h3>
								</div>
								<p className="text-lg whitespace-pre-line p-4 rounded-lg bg-gray-50">
									{user?.skills_message || "未設定"}
								</p>
							</div>

							{/* 自由記載欄 */}
							{user?.freeText && (
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-gray-600">
										<MessageSquare className="w-5 h-5" />
										<h3 className="font-medium">自由記載欄</h3>
									</div>
									<p className="text-lg whitespace-pre-line p-4 rounded-lg bg-gray-50">
										{user.freeText}
									</p>
								</div>
							)}

							{/* 日付情報 */}
							<div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
								<div className="flex items-center gap-1">
									<Calendar className="w-4 h-4" />
									<span>
										登録:{" "}
										{formatDate(
											user?.createdAt ?? new Date(),
											"yyyy/MM/dd HH:mm",
										)}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Calendar className="w-4 h-4" />
									<span>
										更新:{" "}
										{formatDate(
											user?.updatedAt ?? new Date(),
											"yyyy/MM/dd HH:mm",
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
