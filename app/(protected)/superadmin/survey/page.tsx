"use client";

import { useState } from "react";
import { createSurvey, deleteSurvey, updateSurvey } from "@/actions/survey";
import { AddButton } from "@/components/add-button";
import { Plus } from "lucide-react";
import { SurveyModalForm } from "@/components/app-modal/survey-modal-form";
import { useGetSurveys } from "@/components/app-table/hooks/use-table-data";
import { AppTable, type TableColumn } from "@/components/app-table";
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
import type { SurveyFormValues } from "@/lib/validations";
import { IconExternalLink } from "@tabler/icons-react";
import { BarChart3 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight";
import { navConfig } from "@/config";

const surveyColumns = [
	{
		title: "タイトル",
		key: "title",
		sortable: true,
	},
	{
		title: "テーマ",
		key: "theme",
		sortable: true,
	},
	{
		title: "項目数",
		key: "items",
		sortable: false,
		render: (value: SurveyFormValues["items"]) => (
			<span>{value?.length || 0}件</span>
		),
	},
	{
		title: "公開中",
		key: "isPublished",
		sortable: true,
		render: (value: boolean) => (
			<span className={value ? "text-blue-600" : "text-gray-500"}>
				{value ? "公開中" : "非公開"}
			</span>
		),
	},
	{
		title: "操作",
		key: "action",
		sortable: false,
		align: "right" as const,
	},
];

export default function SurveyPage() {
	const queryClient = useQueryClient();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<SurveyFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { data: surveys, isLoading } = useGetSurveys();

	const handleEdit = (item: SurveyFormValues) => {
		// Dateオブジェクトを除外してcurrentDataを設定（Hydrationエラーを防ぐ）
		const cleanData: SurveyFormValues = {
			id: item.id,
			title: item.title || "",
			description: item.description || "",
			theme: item.theme || "default",
			isPublished: item.isPublished ?? false,
			items: (item.items || []).map((surveyItem) => ({
				id: surveyItem.id,
				surveyId: surveyItem.surveyId,
				question: surveyItem.question || "",
				questionType: surveyItem.questionType || "text",
				options: surveyItem.options,
				isRequired: surveyItem.isRequired ?? false,
				order: surveyItem.order || "0",
				// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
			})),
			// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
		};
		setCurrentData(cleanData);
		openModal();
	};

	const handleDelete = (item: SurveyFormValues) => {
		setCurrentData(item);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (currentData?.id) {
			await deleteSurvey(currentData.id);
			CustomToast.success("アンケートを削除しました");
			setIsDeleteDialogOpen(false);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["surveys"] });
		}
	};

	const { handleSubmit } = useSubmit<SurveyFormValues>({
		action: async (data) => {
			if (currentData?.id) {
				await updateSurvey(currentData.id, data);
			} else {
				await createSurvey(data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentData ? "アンケートを更新しました" : "アンケートを登録しました",
			);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["surveys"] });
		},
		onError: () => {
			CustomToast.error("アンケートの保存に失敗しました");
		},
	});

	const handleAdd = () => {
		setCurrentData(null);
		openModal();
	};

	const renderActions = (_value: unknown, item: SurveyFormValues) => (
		<div className="flex items-center gap-2">
			{/* {item?.isPublished && (
				// 公開中の場合、アンケートリンク先を表示
				<Link href={`/adixi-public/survey/${item.id}`} target="_blank">
					<Button variant="ghost" size="sm">
						<IconExternalLink className="h-4 w-4" />
					</Button>
				</Link>
			)} */}
			<Link href={`/superadmin/survey/${item.id}/responses`}>
				<Button variant="ghost" size="sm">
					<BarChart3 className="h-4 w-4" />
				</Button>
			</Link>
			<Button
				variant="outline"
				size="sm"
				onClick={(e) => {
					e.stopPropagation();
					handleEdit(item);
				}}
			>
				編集
			</Button>
			<Button
				variant="destructive"
				size="sm"
				onClick={(e) => {
					e.stopPropagation();
					handleDelete(item);
				}}
			>
				削除
			</Button>
		</div>
	);

	return (
		<div className="mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<h2 className="text-3xl font-bold">
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">
							{navConfig.navMain.find((item) => item.url === "/superadmin/survey")
								?.title || "アンケート管理"}
						</span>
					</PointerHighlight>
				</h2>
				<Button onClick={handleAdd} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					新規アンケート作成
				</Button>
			</div>

			<SurveyModalForm
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentData}
			/>

			<AppTable
				data={(surveys ?? []).map((survey) => {
					// Dateオブジェクトを除外して新しいオブジェクトを作成（Hydrationエラーを防ぐ）
					const { createdAt, updatedAt, ...surveyWithoutDates } = survey;
					return {
						...surveyWithoutDates,
						// items配列からDateオブジェクトを除外
						items: (survey.items || []).map((item) => {
							const { createdAt: itemCreatedAt, updatedAt: itemUpdatedAt, ...itemWithoutDates } = item;
							return itemWithoutDates;
						}),
					};
				})}
				columns={surveyColumns.map((col) =>
					col.key === "action"
						? { ...col, render: renderActions }
						: col,
				) as TableColumn<SurveyFormValues>[]}
				loading={isLoading}
				addButton={{
					text: "新規アンケート作成",
					onClick: handleAdd,
				}}
				searchableKeys={["title", "description"]}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>アンケートの削除</DialogTitle>
						<DialogDescription>
							このアンケートを削除してもよろしいですか？この操作は元に戻せません。
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
