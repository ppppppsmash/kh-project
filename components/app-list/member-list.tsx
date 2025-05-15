"use client";

import { Badge } from "@/components/ui/badge";
import type { MemberFormValues } from "@/lib/validations";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { getMemberColor } from "./member-grid";

interface MemberListViewProps {
	members: MemberFormValues[];
	onSelectMember: (member: MemberFormValues) => void;
}

export default function MemberListView({
	members,
	onSelectMember,
}: MemberListViewProps) {
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	// メンバーごとのカラーをメモ化
	const memberColors = useMemo(() => {
		return members.reduce(
			(acc, member) => {
				acc[member.id || ""] = getMemberColor(member.id);
				return acc;
			},
			{} as Record<string, string>,
		);
	}, [members]);

	return (
		<div className="space-y-4">
			{members.map((member, index) => {
				const memberColor = memberColors[member.id || ""];
				return (
					<motion.div
						key={member.id}
						className="relative"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.4,
							delay: index * 0.05,
							ease: [0.43, 0.13, 0.23, 0.96],
						}}
					>
						<motion.div
							className="relative overflow-hidden rounded-lg border cursor-pointer"
							style={{
								borderColor:
									hoveredId === member.id ? memberColor : "transparent",
								boxShadow:
									hoveredId === member.id
										? `0 0 15px ${memberColor}30`
										: "none",
							}}
							whileHover={{
								y: -5,
								transition: { duration: 0.2 },
							}}
							onHoverStart={() => setHoveredId(member.id || null)}
							onHoverEnd={() => setHoveredId(null)}
							onClick={() => onSelectMember(member)}
						>
							{/* カラーバー */}
							<motion.div
								className="absolute top-0 left-0 h-full w-1"
								style={{ backgroundColor: memberColor }}
								initial={{ scaleY: 0 }}
								animate={{ scaleY: hoveredId === member.id ? 1 : 0 }}
								transition={{ duration: 0.3 }}
							/>

							<div className="flex items-center p-4">
								<div className="flex items-center justify-between w-full">
									{/* プロフィール画像 */}
									<div className="relative mr-4 flex-shrink-0">
										<div
											className="h-28 w-28 rounded-full overflow-hidden border-2"
											style={{
												borderColor:
													hoveredId === member.id ? memberColor : "transparent",
											}}
										>
											<motion.div
												className="h-full w-full bg-cover bg-center"
												style={{ backgroundImage: `url(${member.photoUrl})` }}
												animate={{ scale: hoveredId === member.id ? 1.1 : 1 }}
												transition={{ duration: 0.4 }}
											/>
										</div>

										{/* ホバー時のグロー効果 */}
										{hoveredId === member.id && (
											<motion.div
												className="absolute -inset-1 rounded-full opacity-30 -z-10"
												style={{ backgroundColor: memberColor }}
												initial={{ opacity: 0 }}
												animate={{ opacity: 0.3 }}
												exit={{ opacity: 0 }}
											/>
										)}
									</div>

									{/* メンバー情報 */}
									<div className="flex-grow">
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold">{member?.name}</h3>
										</div>
										<p className="text-muted-foreground">
											{member?.department}
										</p>
										<p className="text-muted-foreground">{member?.position}</p>

										<div className="mt-2 flex flex-wrap gap-2">
											{member?.skills?.map((skill, skillIndex) => (
												<Badge
													key={skill}
													variant="outline"
													className="text-xs"
													style={{
														borderColor: memberColor,
														color:
															hoveredId === member.id ? memberColor : undefined,
													}}
												>
													{skill}
												</Badge>
											)) || (
												<span className="text-muted-foreground text-xs">
													未設定
												</span>
											)}
										</div>
									</div>
								</div>

								{/* 簡易バイオ（ホバー時のみ表示） */}
								<motion.div
									className="hidden md:block max-w-md flex-shrink-0 ml-4 text-sm text-muted-foreground"
									initial={{ opacity: 0, height: 0 }}
									animate={{
										opacity: hoveredId === member.id ? 1 : 0,
										height: hoveredId === member.id ? "auto" : 0,
									}}
									transition={{ duration: 0.3 }}
								>
									{member?.freeText}
								</motion.div>
							</div>
						</motion.div>
					</motion.div>
				);
			})}
		</div>
	);
}
