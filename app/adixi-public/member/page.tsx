"use client";

import MemberCard from "@/components/app-list/member-card";
import { MemberGrid } from "@/components/app-list/member-grid";
import MemberList from "@/components/app-list/member-list";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { AnimatedButton } from "@/components/animation-ui/animated-button";
import { ShimmerButton } from "@/components/animation-ui/shimmer-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDisplayStore } from "@/lib/store/member-display-store";
import { EditMemberModal } from "@/components/animation-ui/edit-member-modal";
import type { MemberFormValues } from "@/lib/validations";
import { Grid, Rows, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function MemberIntroCardPage() {
	const { data: users, isLoading } = useGetUserList();
	const [selectedMember, setSelectedMember] = useState<MemberFormValues | null>(
		null,
	);
	const [isOpen, setIsOpen] = useState(false);
	const { displayMode, setDisplayMode } = useDisplayStore();

	const handleSelectMember = (member: MemberFormValues) => {
		setSelectedMember(member);
	};

	const handleClose = () => {
		setSelectedMember(null);
	};

	const handleEdit = () => {
		setIsOpen(true);
	};

	return (
		<div className="container mx-auto">
			<div className="flex justify-between items-center mb-4">
				<ToggleGroup
					type="single"
					value={displayMode}
					onValueChange={(value) =>
						value && setDisplayMode(value as "grid" | "list")
					}
					className="bg-muted/50 p-1 rounded-lg"
				>
					<ToggleGroupItem
						value="grid"
						aria-label="グリッド表示"
						className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-200"
					>
						<Grid className="h-4 w-4" />
						グリッド
					</ToggleGroupItem>
					<ToggleGroupItem
						value="list"
						aria-label="リスト表示"
						className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-200"
					>
						<Rows className="h-4 w-4" />
						リスト
					</ToggleGroupItem>
				</ToggleGroup>

				<ShimmerButton onClick={handleEdit}>編集</ShimmerButton>
			</div>

			{displayMode === "grid" && (
				<MemberGrid members={users || []} onSelectMember={handleSelectMember} />
			)}
			{displayMode === "list" && (
				<MemberList members={users || []} onSelectMember={handleSelectMember} />
			)}

			<AnimatePresence>
				{selectedMember && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
						transition={{ type: "spring", damping: 25, stiffness: 500 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={handleClose}
					>
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.9 }}
							transition={{ type: "spring", damping: 25, stiffness: 400 }}
							className="relative max-w-2xl w-full"
							onClick={(e) => e.stopPropagation()}
						>
							<AnimatedButton
								variant="ghost"
								size="icon"
								className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm rounded-full"
								onClick={handleClose}
							>
								<X className="h-5 w-5" />
								<span className="sr-only">閉じる</span>
							</AnimatedButton>
							<MemberCard member={selectedMember} />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* <EditMemberModal isOpen={isOpen} onClose={handleClose} member={selectedMember} /> */}
		</div>
	);
}
