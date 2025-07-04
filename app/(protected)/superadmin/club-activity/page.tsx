"use client";

import {
	createClubActivity,
	updateClubActivity,
} from "@/actions/club-activity";
import { deleteClubActivity } from "@/actions/club-activity";
import { AddButton } from "@/components/add-button";
import { ClubModalForm } from "@/components/app-modal/club-modal-form";
import { AppTable } from "@/components/app-table";
import { useGetClubActivities } from "@/components/app-table/hooks/use-table-data";
import { renderClubActivity } from "@/components/app-table/render/ClubActivityItem";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import type { ClubFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { navConfig } from "@/config";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";

export default function ClubActivityPage() {
	const queryClient = useQueryClient();
	const { data: activities, isLoading } = useGetClubActivities();
	const router = useRouter();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<ClubFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { handleSubmit } = useSubmit<ClubFormValues>({
		action: async (data) => {
			if (currentData?.id) {
				await updateClubActivity(currentData.id, data);
			} else {
				await createClubActivity(data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentData ? "部活動を更新しました" : "部活動を登録しました",
			);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["club-activity"] });
		},
		onError: () => {
			CustomToast.error(
				currentData
					? "部活動の更新に失敗しました"
					: "部活動の登録に失敗しました",
			);
		},
	});

	const handleEdit = (data: ClubFormValues, e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentData(data);
		openModal();
	};

	const handleDelete = (data: ClubFormValues, e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentData(data);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (currentData?.id) {
			await deleteClubActivity(currentData.id);
			CustomToast.success("部活動を削除しました");
			setIsDeleteDialogOpen(false);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["club-activity"] });
		}
	};

	const handleAdd = () => {
		setCurrentData(null);
		openModal();
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{navConfig.navMain[5].title}</span>
					</PointerHighlight>
				</h2>
				<AddButton text="新規部活動登録" onClick={handleAdd} />
			</div>

			<AppTable
				toolBar={{
					researchBarPlaceholder: "部活動や部長を検索...",
					//  researchStatusFilter: ["すべてのステータス", "活動中", "休止中", "承認待ち"],
				}}
				columns={renderClubActivity({
					onEdit: handleEdit,
					onDelete: handleDelete,
				})}
				data={activities || []}
				loading={isLoading}
				searchableKeys={[
					"name",
					"leader",
					"description",
					"memberCount",
					"status",
				]}
				onRowClick={(row: ClubFormValues) => {
					router.push(`/superadmin/club-activity/${row.id}`);
				}}
			/>

			<ClubModalForm
				isOpen={isOpen}
				onClose={() => {
					closeModal();
					setCurrentData(null);
				}}
				onSubmit={handleSubmit}
				defaultValues={currentData || undefined}
				title={currentData ? "部活動の編集" : "新規部活動登録"}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>部活動の削除</DialogTitle>
						<DialogDescription>
							この部活動を削除してもよろしいですか？この操作は元に戻せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							キャンセル
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm}>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
