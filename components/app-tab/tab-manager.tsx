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
import type { TagFormValues } from "@/lib/validations";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

interface TagManagerProps {
	onTagSelect: (tagId: string) => void;
	selectedTagId?: string;
	onTagCreate: (data: TagFormValues) => Promise<void>;
	onTagUpdate: (data: TagFormValues) => Promise<void>;
	onTagDelete: (
		data: TagFormValues,
		options: { moveTasksToTagId?: string; deleteTasks?: boolean },
	) => Promise<void>;
	tags: TagFormValues[];
}

export function TagManager({
	onTagSelect,
	selectedTagId,
	onTagCreate,
	onTagUpdate,
	onTagDelete,
	tags,
}: TagManagerProps) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [currentTag, setCurrentTag] = useState<TagFormValues | null>(null);
	const [newTagName, setNewTagName] = useState("");
	const [moveToTagId, setMoveToTagId] = useState("");

	return (
		<div className="flex flex-col space-y-4 mb-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">タグ一覧</h3>
				<Button onClick={() => setIsAddModalOpen(true)}>新規タグを追加</Button>
			</div>

			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<div
						key={tag.id}
						className={`group flex items-center gap-2 p-2 rounded-lg border ${
							selectedTagId === tag.id
								? "border-primary bg-primary/5"
								: "border-border"
						}`}
					>
						<div
							className={`flex-1 text-center cursor-pointer ${
								selectedTagId === tag.id ? "font-medium" : ""
							}`}
							onClick={() => onTagSelect(tag.id ?? "")}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.stopPropagation();
								}
							}}
						>
							{tag.name}
						</div>
						{selectedTagId === tag.id && (
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
												setCurrentTag(tag);
												setNewTagName(tag.name);
												setIsEditModalOpen(true);
											}}
										>
											編集
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setCurrentTag(tag);
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
						<DialogTitle>新規タグを作成</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							await onTagCreate({ name: newTagName });
							setNewTagName("");
							setIsAddModalOpen(false);
						}}
					>
						<Input
							value={newTagName}
							onChange={(e) => setNewTagName(e.target.value)}
							placeholder="タグ名を入力"
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
						<DialogTitle>タグを編集</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							if (currentTag) {
								await onTagUpdate({ ...currentTag, name: newTagName });
								setNewTagName("");
								setIsEditModalOpen(false);
							}
						}}
					>
						<Input
							value={newTagName}
							onChange={(e) => setNewTagName(e.target.value)}
							placeholder="タグ名を入力"
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
								<label htmlFor="moveTasks">タスクを別のタグに移動</label>
							</div>
							<select
								className="w-full p-2 border rounded-md"
								onChange={(e) => setMoveToTagId(e.target.value)}
							>
								<option value="">移動先のタグを選択</option>
								{tags
									.filter((tag: TagFormValues) => tag.id !== currentTag?.id)
									.map((tag: TagFormValues) => (
										<option key={tag.id} value={tag.id}>
											{tag.name}
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
								if (currentTag) {
									const taskAction = document.querySelector(
										'input[name="taskAction"]:checked',
									) as HTMLInputElement;
									const options = {
										moveTasksToTagId:
											taskAction?.value === "move" ? moveToTagId : undefined,
										deleteTasks: taskAction?.value === "delete",
									};
									await onTagDelete(currentTag, options);
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
