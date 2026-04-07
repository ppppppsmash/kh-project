"use client";

import { useState } from "react";
import { createQA, deleteQA, updateQA } from "@/actions/qa";
import { AccordionTable } from "@/components/app-accordion-table";
import { renderQa } from "@/components/app-accordion-table/render/QAItem";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { useGetQa } from "@/components/app-table/hooks/use-table-data";
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
import { useQaCategories } from "@/hooks/use-qa-categories";
import { useSubmit } from "@/lib/submitHandler";
import type { QaFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight"
import { getNavTitle } from "@/config";
import { exportFilteredQaToCSV } from "@/lib/csv-export";

export default function AdminQAPage() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<QaFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const itemsPerPage = 10;

	const { data: qaItems, isLoading } = useGetQa();
	const role = session?.user?.role;
	const categories = useQaCategories(qaItems);

	const handleEdit = (item: QaFormValues) => {
		setCurrentData(item);
		openModal();
	};

	const handleDelete = (item: QaFormValues) => {
		setCurrentData(item);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (currentData?.id) {
			await deleteQA(currentData.id);
			CustomToast.success("QAを削除しました");
			setIsDeleteDialogOpen(false);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["qa"] });
		}
	};

	const { handleSubmit } = useSubmit<QaFormValues>({
		action: async (data) => {
			if (currentData?.id) {
				await updateQA(currentData.id, data);
			} else {
				await createQA(data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentData ? "QAを更新しました" : "QAを登録しました",
			);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["qa"] });
		},
		onError: () => {
			CustomToast.error("QAの保存に失敗しました");
		},
	});

	const handleAdd = () => {
		setCurrentData(null);
		openModal();
	};

	const handleCSVExport = (filteredData: QaFormValues[], searchTerm: string, categoryFilter: string) => {
		try {
			exportFilteredQaToCSV(
				filteredData,
				searchTerm,
				categoryFilter
			);
			CustomToast.success("CSVファイルをエクスポートしました");
		} catch (error) {
			console.error("CSVエクスポートエラー:", error);
			CustomToast.error("CSVエクスポートに失敗しました");
		}
	};

	return (
		<div className="mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{getNavTitle("/superadmin/qa")}</span>
					</PointerHighlight>
				</h2>
			</div>

			<QaModalForm
				type={role || ""}
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentData}
			/>

			<AccordionTable
				data={(qaItems ?? []).map((item) => ({
					...item,
					id: item.id || "",
					answer: item.answer || "",
					isPublic: item.isPublic ?? false,
					startedAt: item.startedAt ?? new Date(),
					createdAt: item.createdAt ?? new Date(),
					updatedAt: item.updatedAt ?? new Date(),
				}))}
				columns={renderQa({
					onEdit: handleEdit,
					onDelete: handleDelete,
				})}
				idField="id"
				addButton={{
					text: "新規QA登録",
					onClick: handleAdd,
					className: "",
				}}
				searchFields={["question", "answer"]}
				categoryField="category"
				categories={categories}
				renderContent={(item) => (
					<div className="rounded-md bg-muted/50 p-4">
						<p className="mb-2 text-sm text-muted-foreground">
							回答者: {item.answeredBy}
						</p>
						{item.answer}
					</div>
				)}
				itemsPerPage={itemsPerPage}
				csvButton={{
					text: "CSV出力",
					onClick: handleCSVExport,
					className: "",
				}}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>QAの削除</DialogTitle>
						<DialogDescription>
							このQAを削除してもよろしいですか？この操作は元に戻せません。
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
