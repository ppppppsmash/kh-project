"use client";

import { useMemo, useState } from "react";
import { createQA, deleteQA, updateQA } from "@/actions/qa";
import { AddButton } from "@/components/add-button";
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
import { useSubmit } from "@/lib/submitHandler";
import type { QaFormValues } from "@/lib/validations";
import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AuroraText } from "@/components/animation-ui/aurora-text";
// 固定のカテゴリーリスト
const defaultCategories = [
	"現場",
	"経費",
	"福利厚生",
	"休暇",
	"週報",
	"その他",
];

export default function AdminQAPage() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<QaFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const itemsPerPage = 10;

	const { data: qaItems, isLoading } = useGetQa();
	const role = session?.user?.role;

	// カテゴリーリストを計算
	const categories = useMemo(() => {
		// DBから取得したカテゴリーで、デフォルトカテゴリーに含まれていないものだけを抽出
		const dbCategories = Array.from(
			new Set(qaItems?.map((item) => item.category) ?? []),
		)
			.filter(Boolean)
			.filter((category) => !defaultCategories.includes(category));

		// デフォルトカテゴリーとDBのカテゴリーを結合
		return [...defaultCategories, ...dbCategories];
	}, [qaItems]);

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

	return (
		<div className="mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<h2 className="text-3xl font-bold">
					<AuroraText>QA管理</AuroraText>
				</h2>
				<AddButton text="新規QA登録" onClick={handleAdd} />
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
