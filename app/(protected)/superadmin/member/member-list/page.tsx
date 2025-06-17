"use client";

import { UserDetailModal } from "@/components/app-modal/user-detail-modal";
import { AppTable } from "@/components/app-table";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { Button } from "@/components/ui/button";
import type { MemberFormValues } from "@/lib/validations";
import { FilePenLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight"
import { navConfig } from "@/config";

export default function MemberListPage() {
	const { data: users, isLoading } = useGetUserList();
	const [selectedUser, setSelectedUser] = useState<MemberFormValues | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleRowClick = (user: MemberFormValues) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedUser(null);
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{navConfig.navMain[1].items?.[1]?.title || ""}</span>
					</PointerHighlight>
				</h2>
			</div>
			<div className="space-y-8">
				<Button variant="outline">
					<FilePenLine className="h-4 w-4" />
					<Link target="_blank" href="/adixi-public/member/">
						LDRページへ
					</Link>
				</Button>

				<AppTable
					toolBar={{
						researchBarPlaceholder: "名前や事業部を検索...",
					}}
					columns={renderMemberIntroCard()}
					data={users || []}
					loading={isLoading}
					searchableKeys={[
						"name",
						"department",
						"position",
						"hobby",
						"skills",
						"freeText",
					]}
					onRowClick={(row: MemberFormValues) => {
						handleRowClick(row);
					}}
				/>
			</div>

			<UserDetailModal
				user={selectedUser}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
}
