"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { TabFormValues } from "@/lib/validations";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

interface TabManagerProps {
	onTabSelect: (tabId: string) => void;
	selectedTabId?: string;
	onTabCreate: (data: TabFormValues) => Promise<void>;
	onTabUpdate: (data: TabFormValues) => Promise<void>;
	onTabDelete: (
		data: TabFormValues,
		options: { moveTasksToTabId?: string; deleteTasks?: boolean },
	) => Promise<void>;
	tabs: TabFormValues[];
}

export function TabManager({
	onTabSelect,
	selectedTabId,
	onTabCreate,
	onTabUpdate,
	onTabDelete,
	tabs,
}: TabManagerProps) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [currentTab, setCurrentTab] = useState<TabFormValues | null>(null);
	const [newTabName, setNewTabName] = useState("");
	const [moveToTabId, setMoveToTabId] = useState("");

	return (
		<div className="flex flex-col space-y-4 mb-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">タブ一覧</h3>
				<Button onClick={() => setIsAddModalOpen(true)}>新規タブを追加</Button>
			</div>

			<div className="flex flex-wrap gap-2">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={`group flex items-center gap-2 p-2 rounded-lg border ${
							selectedTabId === tab.id
								? "border-primary bg-primary/5"
								: "border-border"
						}`}
					>
						<div
							className={`flex-1 text-center cursor-pointer ${
								selectedTabId === tab.id ? "font-medium" : ""
							}`}
							onClick={() => onTabSelect(tab.id ?? "")}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.stopPropagation();
								}
							}}
						>
							{tab.name}
						</div>
						{selectedTabId === tab.id && (
							<div className="transition-opacity">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											onClick={(e) => e.stopPropagation()}
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setCurrentTab(tab);
												setNewTabName(tab.name);
												setIsEditModalOpen(true);
											}}
										>
											編集
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setCurrentTab(tab);
												setIsDeleteModalOpen(true);
											}}
											className="text-destructive"
										>
											削除
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>
				))}
			</div>

			{/* 新規タブ作成モーダル */}
			<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>新規タブを作成</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							await onTabCreate({ name: newTabName });
							setNewTabName("");
							setIsAddModalOpen(false);
						}}
					>
						<Input
							value={newTabName}
							onChange={(e) => setNewTabName(e.target.value)}
							placeholder="タブ名を入力"
							className="mb-4"
						/>
						<DialogFooter>
							<Button type="submit">作成</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* タブ編集モーダル */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>タブを編集</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							if (currentTab) {
								await onTabUpdate({ ...currentTab, name: newTabName });
								setNewTabName("");
								setIsEditModalOpen(false);
							}
						}}
					>
						<Input
							value={newTabName}
							onChange={(e) => setNewTabName(e.target.value)}
							placeholder="タブ名を入力"
							className="mb-4"
						/>
						<DialogFooter>
							<Button type="submit">更新</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* タブ削除確認モーダル */}
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>タブを削除</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p>
							このタブを削除する前に、関連するタスクの処理方法を選択してください：
						</p>
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<input
									type="radio"
									id="moveTasks"
									name="taskAction"
									value="move"
									defaultChecked
									className="h-4 w-4"
								/>
								<label htmlFor="moveTasks">タスクを別のタブに移動</label>
							</div>
							<select
								className="w-full p-2 border rounded-md"
								onChange={(e) => setMoveToTabId(e.target.value)}
							>
								<option value="">移動先のタブを選択</option>
								{tabs
									.filter((tab) => tab.id !== currentTab?.id)
									.map((tab) => (
										<option key={tab.id} value={tab.id}>
											{tab.name}
										</option>
									))}
							</select>
						</div>
						<div className="flex items-center space-x-2">
							<input
								type="radio"
								id="deleteTasks"
								name="taskAction"
								value="delete"
								className="h-4 w-4"
							/>
							<label htmlFor="deleteTasks">タスクを削除</label>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteModalOpen(false)}
						>
							キャンセル
						</Button>
						<Button
							variant="destructive"
							onClick={async () => {
								if (currentTab) {
									const taskAction = document.querySelector(
										'input[name="taskAction"]:checked',
									) as HTMLInputElement;
									const options = {
										moveTasksToTabId:
											taskAction?.value === "move" ? moveToTabId : undefined,
										deleteTasks: taskAction?.value === "delete",
									};
									await onTabDelete(currentTab, options);
									setIsDeleteModalOpen(false);
								}
							}}
						>
							削除
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
