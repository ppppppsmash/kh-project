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
	getTaskPriorityFilters,
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Plus, X, RotateCcw } from "lucide-react";
import { DeleteTabDialog } from "@/components/app-modal/delete-tab-dialog";
import { PointerHighlight } from "@/components/animation-ui/pointer-highlight"
import { navConfig } from "@/config";
import { exportFilteredTasksToCSV } from "@/lib/csv-export";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
	const { 
		activeTab, 
		setActiveTab, 
		addTab, 
		removeTab, 
		tabFilters, 
		setTabFilter, 
		resetTabFilters,
	} = useTabStore();
	const [isDeleteTabDialogOpen, setIsDeleteTabDialogOpen] = useState(false);
	const [tabToDelete, setTabToDelete] = useState<{ id: string; name: string } | null>(null);

	// カスタムタブが選択されているかどうかを判定
	const isCustomTabSelected = () => {
		return activeTab !== "active" && 
			activeTab !== "in-progress" && 
			activeTab !== "completed" && 
			tabs?.some(tab => tab.id === activeTab);
	};

	// 複数タブ選択による絞り込みと詳細フィルターを適用
	const getFilteredTasks = () => {
		if (!tasks) return [];
		
		// 選択されたタブのIDを取得
		const checkedTabIds = tabFilters
			.filter(filter => filter.isChecked)
			.map(filter => filter.id);
		
		// カスタムタブが選択されているかどうかを判定
		const isCustomTabActive = isCustomTabSelected();
		
		// タスクを絞り込む
		let filteredTasks: TaskFormValues[] = [];
		
		if (isCustomTabActive) {
			// カスタムタブが選択されている場合
			const customTabId = activeTab;
			const customTasks = tasks.filter(task => task.tabId === customTabId);
			filteredTasks = customTasks;
		} else {
			// デフォルトタブが選択されている場合
			const finalFilteredTasks: TaskFormValues[] = [];
			
			// 未完了タスクのフィルター適用（進行中と未着手を含む）
			if (checkedTabIds.includes("active")) {
				const activeTasks = tasks.filter(task => 
					task.progress === "pending" || task.progress === "inProgress"
				);
				finalFilteredTasks.push(...activeTasks);
			}
			
			// 進行中タスクのフィルター適用
			if (checkedTabIds.includes("in-progress")) {
				const inProgressTasks = tasks.filter(task => task.progress === "inProgress");
				finalFilteredTasks.push(...inProgressTasks);
			}
			
			// 完了タスクのフィルター適用
			if (checkedTabIds.includes("completed")) {
				const completedTasks = tasks.filter(task => task.progress === "completed");
				finalFilteredTasks.push(...completedTasks);
			}
			
			filteredTasks = finalFilteredTasks;
		}
		
		return filteredTasks;
	};

	const filteredTasks = getFilteredTasks();

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

	const handleCSVExport = (filteredTasks: TaskFormValues[], searchQuery: string, statusFilter: string) => {
		try {
			exportFilteredTasksToCSV(
				filteredTasks,
				categories ?? [],
				searchQuery,
				statusFilter
			);
			CustomToast.success("CSVファイルをエクスポートしました");
		} catch (error) {
			console.error("CSVエクスポートエラー:", error);
			CustomToast.error("CSVエクスポートに失敗しました");
		}
	};

	const renderTabContent = (tabId: string) => {
		if (tabId === "active") {
			// チェックボックスの状態に基づいてフィルタリングされたタスクを使用
			return (
				<div className="space-y-4">
					<AppTable
						sort={sort}
						onSortChange={setSort}
						columns={renderTask({
							onEdit: handleEdit,
							onDelete: handleDelete,
							onAdd: handleAdd,
							categories: categories ?? [],
						})}
						data={filteredTasks}
						loading={isLoading}
						searchableKeys={["taskId", "title", "assignee", "dueDate"]}
						toolBar={{
							researchBarPlaceholder: "タスク検索",
							researchStatusFilter: getTaskStatusFilters().filter(status => status !== "完了"),
							researchPriorityFilter: getTaskPriorityFilters(),
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
						csvButton={{
							text: "CSV出力",
							onClick: () => handleCSVExport(filteredTasks, "", "すべて"),
							className: "",
						}}
					/>
				</div>
			);
		}

		if (tabId === "in-progress") {
			// チェックボックスの状態に基づいてフィルタリングされたタスクを使用
			return (
				<div className="space-y-4">
					<AppTable
						sort={sort}
						onSortChange={setSort}
						columns={renderTask({
							onEdit: handleEdit,
							onDelete: handleDelete,
							onAdd: handleAdd,
							categories: categories ?? [],
						})}
						data={filteredTasks}
						loading={isLoading}
						searchableKeys={["taskId", "title", "assignee", "dueDate"]}
						toolBar={{
							researchBarPlaceholder: "タスク検索",
							researchStatusFilter: ["すべて", "進行中"],
							researchPriorityFilter: getTaskPriorityFilters(),
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
						csvButton={{
							text: "CSV出力",
							onClick: () => handleCSVExport(filteredTasks, "", "すべて"),
							className: "",
						}}
					/>
				</div>
			);
		}

		if (tabId === "completed") {
			// チェックボックスの状態に基づいてフィルタリングされたタスクを使用
			return (
				<div className="space-y-4">
					<AppTable
						sort={sort}
						onSortChange={setSort}
						columns={renderTask({
							onEdit: handleEdit,
							onDelete: handleDelete,
							onAdd: handleAdd,
							categories: categories ?? [],
						})}
						data={filteredTasks}
						loading={isLoading}
						searchableKeys={["taskId", "title", "assignee", "dueDate"]}
						toolBar={{
							researchBarPlaceholder: "タスク検索",
							researchStatusFilter: ["すべて", "完了"],
							researchPriorityFilter: getTaskPriorityFilters(),
						}}
						onFilter={filterTask}
						onRowClick={(row: TaskFormValues) => {
							setSelectedTask(row);
							setIsDetailOpen(true);
						}}
						csvButton={{
							text: "CSV出力",
							onClick: () => handleCSVExport(filteredTasks, "", "すべて"),
							className: "",
						}}
					/>
				</div>
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
					<PointerHighlight
						rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
						pointerClassName="text-purple-500"
					>
						<span className="relative z-10">{navConfig.navMain[3].title}</span>
					</PointerHighlight>
				</h2>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<div className="space-y-3">					
					{/* タブリスト（チェックボックス付き）と全選択ボタンを横並び */}
					<div className="flex items-center gap-3">
						{/* 全選択ボタン */}
						<Button
							variant="outline"
							size="sm"
							onClick={resetTabFilters}
							className="h-8 px-3 whitespace-nowrap"
						>
							<RotateCcw className="h-3 w-3 mr-1" />
							全選択
						</Button>
						
						{/* タブリスト（チェックボックス付き） */}
						<div className="flex items-center gap-2 flex-wrap">
							{/* デフォルトタブ */}
							{tabFilters.map((filter) => (
								<div key={filter.id} className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
									<Checkbox
										id={filter.id}
										checked={filter.isChecked}
										onCheckedChange={(checked) => {
											if (checked) {
												// カスタムタブが選択中の場合は、その状態を解除
												if (isCustomTabSelected()) {
													// カスタムタブを非アクティブにする
													setActiveTab("active");
												}
											}
											setTabFilter(filter.id, checked === true);
										}}
									/>
									<Label 
										htmlFor={filter.id} 
										className="text-sm font-medium cursor-pointer select-none"
									>
										{filter.name}
									</Label>
								</div>
							))}
							
							{/* カスタムタブ */}
							{tabs?.map((tab) => {
								if (!tab.id) return null;
								const tabId = tab.id;
								const isActiveCustomTab = activeTab === tabId && isCustomTabSelected();
								
								return (
									<div key={tabId} className={`flex items-center space-x-2 rounded-lg px-3 py-2 relative group ${
										isActiveCustomTab 
											? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
											: 'bg-muted/50'
									}`}>
										<button
											type="button"
											onClick={() => {
												// デフォルトタブのチェックを外す
												setTabFilter("active", false);
												setTabFilter("in-progress", false);
												setTabFilter("completed", false);
												// カスタムタブをアクティブにする
												setActiveTab(tabId);
											}}
											className={`text-sm font-medium transition-colors cursor-pointer ${
												isActiveCustomTab 
													? 'text-blue-700 dark:text-blue-300' 
													: 'text-muted-foreground hover:text-foreground'
											}`}
										>
											{tab.name}
										</button>
										{/* 削除ボタン */}
										<Button
											variant="ghost"
											size="icon"
											className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteTab({ id: tabId, name: tab.name || "" });
											}}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								);
							})}
							
							{/* 新規タブ追加ボタン */}
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsAddTabDialogOpen(true)}
								className="h-8 px-3"
							>
								<Plus className="h-4 w-4 mr-1" />
								タブ追加
							</Button>
						</div>
					</div>
				</div>

				<TabsContent value="active">
					{renderTabContent("active")}
				</TabsContent>
				<TabsContent value="in-progress">
					{renderTabContent("in-progress")}
				</TabsContent>
				<TabsContent value="completed">
					{renderTabContent("completed")}
				</TabsContent>
				{tabs?.map((tab) => {
					if (!tab.id) return null;
					const tabId = tab.id;
					return (
						<TabsContent key={tabId} value={tabId}>
							<div className="space-y-4">
								<AppTable
									sort={sort}
									onSortChange={setSort}
									columns={renderTask({
										onEdit: handleEdit,
										onDelete: handleDelete,
										onAdd: handleAdd,
										categories: categories ?? [],
									})}
									data={filteredTasks.filter(task => task.tabId === tabId)}
									loading={isLoading}
									searchableKeys={["taskId", "title", "assignee", "dueDate"]}
									toolBar={{
										researchBarPlaceholder: "タスク検索",
										researchStatusFilter: getTaskStatusFilters(),
										researchPriorityFilter: getTaskPriorityFilters(),
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
									csvButton={{
										text: "CSV出力",
										onClick: () => handleCSVExport(filteredTasks.filter(task => task.tabId === tabId), "", "すべて"),
										className: "",
									}}
								/>
							</div>
						</TabsContent>
					);
				})}
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
