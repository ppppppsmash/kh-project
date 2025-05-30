"use client";

import { createTask, deleteTask, updateTask } from "@/actions/task";
import { TaskModalForm } from "@/components/app-modal/task-modal-form";
import { AddTabDialog } from "@/components/app-modal/add-tab-dialog";
import { TaskDetailSheet } from "@/components/app-sheet/task-detail-sheet";
import { AppTable } from "@/components/app-table";
import { useGetTasks, useGetCategories, useGetTabs } from "@/components/app-table/hooks/use-table-data";
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
import { useTabStore } from "@/lib/store/tab-store";
import { useSubmit } from "@/lib/submitHandler";
import type { TaskFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AuroraText } from "@/components/animation-ui/aurora-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import { DeleteTabDialog } from "@/components/app-modal/delete-tab-dialog";

export default function TaskPage() {
	const queryClient = useQueryClient();
	const { data: tasks, isLoading } = useGetTasks();
	const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();
	const { data: tabs, isLoading: isTabsLoading } = useGetTabs();
	const [selectedTask, setSelectedTask] = useState<TaskFormValues | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<TaskFormValues | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { sort, setSort } = useTaskTableSort();
	const [isAddTabDialogOpen, setIsAddTabDialogOpen] = useState(false);
	const { activeTab, setActiveTab, addTab, removeTab } = useTabStore();
	const [isDeleteTabDialogOpen, setIsDeleteTabDialogOpen] = useState(false);
	const [tabToDelete, setTabToDelete] = useState<{ id: string; name: string } | null>(null);

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
			queryClient.invalidateQueries({ queryKey: ["tabs"] });
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
			queryClient.invalidateQueries({ queryKey: ["tabs"] });
		}
	};

	const handleAdd = () => {
		// Sheetを開く前にselectedTaskとcurrentDataをリセット
		setSelectedTask(null);
		// 新規登録の場合はcurrentDataをnullにする
		setCurrentData(null);
		openModal();
	};

	const handleDeleteTab = (tab: { id: string; name: string }) => {
		setTabToDelete(tab);
		setIsDeleteTabDialogOpen(true);
	};

	const handleDeleteTabConfirm = () => {
		if (tabToDelete) {
			removeTab(tabToDelete.id);
			setTabToDelete(null);
			setIsDeleteTabDialogOpen(false);
			CustomToast.success("タブを削除しました");
			queryClient.invalidateQueries({ queryKey: ["tabs"] });
		}
	};

	const renderTabContent = (tabId: string) => {
		if (tabId === "active") {
			return (
				<AppTable
					sort={sort}
					onSortChange={setSort}
					columns={renderTask({
						onEdit: handleEdit,
						onDelete: handleDelete,
						onAdd: handleAdd,
						categories: categories ?? [],
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
			);
		}

		if (tabId === "completed") {
			return (
				<AppTable
					sort={sort}
					onSortChange={setSort}
					columns={renderTask({
						onEdit: handleEdit,
						onDelete: handleDelete,
						onAdd: handleAdd,
						categories: categories ?? [],
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
			);
		}

		// カスタムタブの場合は空のテーブルを表示
		return (
			<AppTable
				sort={sort}
				onSortChange={setSort}
				columns={renderTask({
					onEdit: handleEdit,
					onDelete: handleDelete,
					onAdd: handleAdd,
					categories: categories ?? [],
				})}
				data={[]}
				loading={false}
				searchableKeys={["taskId", "title", "assignee", "dueDate"]}
				toolBar={{
					researchBarPlaceholder: "タスク検索",
					researchStatusFilter: getTaskStatusFilters(),
				}}
				onFilter={filterTask}
				onRowClick={(row: TaskFormValues) => {
					setSelectedTask(row);
					setIsDetailOpen(true);
				}}
			/>
		);
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-3xl font-bold">
					<AuroraText>タスク管理</AuroraText>
				</h2>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<div className="flex items-center gap-2">
					<TabsList>
						<TabsTrigger value="active">未完了のタスク</TabsTrigger>
						<TabsTrigger value="completed">完了したタスク</TabsTrigger>
						{tabs?.map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id || ""}
								className="relative group"
							>
								{tab.name}
								{tab.id && (
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteTab({ id: tab.id || "", name: tab.name || "" });
										}}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</TabsTrigger>
						))}
					</TabsList>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setIsAddTabDialogOpen(true)}
						className="h-9 w-9"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>

				<TabsContent value="active">
					{renderTabContent("active")}
				</TabsContent>
				<TabsContent value="completed">
					{renderTabContent("completed")}
				</TabsContent>
				{tabs?.map((tab) => (
					<TabsContent key={tab.id} value={tab.id || ""}>
						<AppTable
							sort={sort}
							onSortChange={setSort}
							columns={renderTask({
								onEdit: handleEdit,
								onDelete: handleDelete,
								onAdd: handleAdd,
								categories: categories ?? [],
							})}
							data={tasks?.filter(task => task.tabId === tab.id) ?? []}
							loading={isLoading}
							searchableKeys={["taskId", "title", "assignee", "dueDate"]}
							toolBar={{
								researchBarPlaceholder: "タスク検索",
								researchStatusFilter: getTaskStatusFilters(),
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
				))}
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
				categories={categories ?? []}
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
				categories={categories ?? []}
				tabs={tabs ?? []}
			/>

			<AddTabDialog
				isOpen={isAddTabDialogOpen}
				onClose={() => setIsAddTabDialogOpen(false)}
				onAdd={addTab}
			/>

			<DeleteTabDialog
				isOpen={isDeleteTabDialogOpen}
				onClose={() => {
					setIsDeleteTabDialogOpen(false);
					setTabToDelete(null);
				}}
				onConfirm={handleDeleteTabConfirm}
				tabName={tabToDelete?.name || ""}
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
