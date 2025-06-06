"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, getProgressColor, getProgressLabel } from "@/lib/utils";
import type { CategoryValues, TaskFormValues } from "@/lib/validations";
import { Check, Clock, ListTodo, Pencil, Trash2 } from "lucide-react";

interface TaskDetailSheetProps {
	task: TaskFormValues | null;
	isOpen: boolean;
	onClose: () => void;
	onEdit: (task: TaskFormValues) => void;
	onDelete: (task: TaskFormValues) => void;
	categories: CategoryValues[];
}

// タスク進捗アイコン
export const getProgressIcon = (progress: TaskFormValues["progress"]) => {
	switch (progress) {
		case "pending":
			return <ListTodo className="h-3.5 w-3.5" />;
		case "inProgress":
			return <Clock className="h-3.5 w-3.5" />;
		case "completed":
			return <Check className="h-3.5 w-3.5" />;
	}
};

export const TaskDetailSheet = ({
	task,
	isOpen,
	onClose,
	onEdit,
	onDelete,
	categories,
}: TaskDetailSheetProps) => {
	if (!task) return null;

	const category = categories.find(cat => cat.id === task.categoryId);

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="text-2xl">{task.title}</SheetTitle>
					<div className="flex items-center gap-2">
						<Badge className={`${getProgressColor(task.progress)} text-white`}>
							{getProgressIcon(task.progress)}
							{getProgressLabel(task.progress)}
						</Badge>
						<span className="text-sm text-gray-500">
							作成日:{" "}
							{task.createdAt
								? formatDate(task.createdAt, "yyyy/MM/dd HH:mm")
								: "未設定"}
						</span>
					</div>
				</SheetHeader>

				<div className="space-y-6 p-6">
					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-1">タスクID</h3>
						<p className="text-gray-900 dark:text-gray-100">{task.taskId}</p>
					</div>
					{task.categoryId && (
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">
								タスクカテゴリー
							</h3>
							<p className="text-gray-900 dark:text-gray-100">
								{category?.name || "未設定"}
							</p>
						</div>
					)}
					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-1">担当者</h3>
						<p className="text-gray-900 dark:text-gray-100">{task.assignee}</p>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">起票日</h3>
							<p className="text-gray-900 dark:text-gray-100">
								{formatDate(task.startedAt, "yyyy/MM/dd")}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">期限</h3>
							<p className="text-gray-900 dark:text-gray-100">
								{formatDate(task.dueDate, "yyyy/MM/dd")}
							</p>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-1">内容</h3>
						<p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
							{task.content}
						</p>
					</div>

					{task.progressDetails && (
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">
								進捗状況・対応内容
							</h3>
							<p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
								{task.progressDetails}
							</p>
						</div>
					)}

					{task.link && (
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">
								リンク先
							</h3>
							<a
								href={task.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 dark:text-blue-400 hover:underline break-all"
							>
								{task.link}
							</a>
						</div>
					)}

					{task.notes && (
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-1">備考</h3>
							<p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
								{task.notes}
							</p>
						</div>
					)}

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" size="sm" onClick={() => onEdit(task)}>
							<Pencil className="h-4 w-4" />
							編集
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onDelete(task)}
						>
							<Trash2 className="h-4 w-4" />
							削除
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};
