"use client";

import { createTask, deleteTask, updateTask } from "@/actions/task";
import { TaskModalForm } from "@/components/app-modal/task-modal-form";
import { TaskDetailSheet } from "@/components/app-sheet/task-detail-sheet";
import { AppTable } from "@/components/app-table";
import { useGetTasks } from "@/components/app-table/hooks/use-table-data";
import {
	filterTask,
	getTaskStatusFilters,
	renderTask,
} from "@/components/app-table/render/TaskItem";
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
import { useTaskTableSort } from "@/lib/store/task-store";
import { useSubmit } from "@/lib/submitHandler";
import type { TaskFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AuroraText } from "@/components/animation-ui/aurora-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskStatus } from "@/lib/store/task-store";

export default function TaskPage() {
	const queryClient = useQueryClient();
	const { data: tasks, isLoading } = useGetTasks();
	const [selectedTask, setSelectedTask] = useState<TaskFormValues | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<TaskFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { sort, setSort } = useTaskTableSort();
	const { activeTab, setActiveTab } = useTaskStatus();

	const { handleSubmit } = useSubmit<TaskFormValues>({
		action: async (data) => {
			if (currentData?.id) {
				await updateTask(currentData.id, data);
			} else {
				await createTask(data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentData ? "タスクを更新しました" : "タスクを登録しました",
			);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: () => {
			CustomToast.error(
				currentData
					? "タスクの更新に失敗しました"
					: "タスクの登録に失敗しました",
			);
		},
	});

	const handleEdit = (row: TaskFormValues, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedTask(row);
		setCurrentData(row);
		openModal();
	};

	const handleDelete = (row: TaskFormValues, e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentData(row);
		setSelectedTask(row);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (currentData?.id) {
			await deleteTask(currentData.id);
			CustomToast.success("タスクを削除しました");
			setIsDeleteDialogOpen(false);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		}
	};

	const handleAdd = () => {
		// Sheetを開く前にselectedTaskとcurrentDataをリセット
		setSelectedTask(null);
		// 新規登録の場合はcurrentDataをnullにする
		setCurrentData(null);
		openModal();
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-3xl font-bold">
					<AuroraText>タスク管理</AuroraText>
				</h2>
			</div>

			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "completed")} className="space-y-4">
				<TabsList>
					<TabsTrigger value="active">未完了のタスク</TabsTrigger>
					<TabsTrigger value="completed">完了したタスク</TabsTrigger>
				</TabsList>

				<TabsContent value="active">
					<AppTable
						sort={sort}
						onSortChange={setSort}
						columns={renderTask({
							onEdit: handleEdit,
							onDelete: handleDelete,
							onAdd: handleAdd,
						})}
						data={tasks?.filter(task => task.progress !== "completed") ?? []}
						loading={isLoading}
						searchableKeys={["taskId", "title", "assignee", "dueDate"]}
						toolBar={{
							researchBarPlaceholder: "タスク検索",
							researchStatusFilter: getTaskStatusFilters().filter(status => status !== "完了"),
						}}
						onFilter={filterTask}
						onRowClick={(row: TaskFormValues) => {
							setSelectedTask(row);
							setIsDetailOpen(true);
						}}
						addButton={{
							text: "新規タスク登録",
							onClick: handleAdd,
							className: "",
						}}
					/>
				</TabsContent>

				<TabsContent value="completed">
					<AppTable
						sort={sort}
						onSortChange={setSort}
						columns={renderTask({
							onEdit: handleEdit,
							onDelete: handleDelete,
							onAdd: handleAdd,
						})}
						data={tasks?.filter(task => task.progress === "completed") ?? []}
						loading={isLoading}
						searchableKeys={["taskId", "title", "assignee", "dueDate"]}
						toolBar={{
							researchBarPlaceholder: "タスク検索",
							researchStatusFilter: ["すべて", "完了"],
						}}
						onFilter={filterTask}
						onRowClick={(row: TaskFormValues) => {
							setSelectedTask(row);
							setIsDetailOpen(true);
						}}
					/>
				</TabsContent>
			</Tabs>

			<TaskDetailSheet
				task={selectedTask}
				isOpen={isDetailOpen}
				onClose={() => setIsDetailOpen(false)}
				onEdit={(task) => {
					setSelectedTask(task);
					setCurrentData(task);
					setIsDetailOpen(false);
					openModal();
				}}
				onDelete={(task) => {
					setSelectedTask(task);
					setCurrentData(task);
					setIsDeleteDialogOpen(true);
					setIsDetailOpen(false);
				}}
			/>

			<TaskModalForm
				isOpen={isOpen}
				onClose={() => {
					closeModal();
					setSelectedTask(null);
					setCurrentData(null);
				}}
				onSubmit={handleSubmit}
				defaultValues={selectedTask ?? undefined}
				title={selectedTask ? "タスク編集" : "新規タスク登録"}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>タスクの削除</DialogTitle>
						<DialogDescription>
							このタスクを削除してもよろしいですか？この操作は元に戻せません。
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
