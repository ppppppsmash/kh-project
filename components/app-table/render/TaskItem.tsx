import { getProgressIcon } from "@/components/app-sheet/task-detail-sheet";
import type { TableColumn } from "@/components/app-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import { getProgressColor, getProgressLabel } from "@/lib/utils";
import type { TaskFormValues } from "@/lib/validations";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

type TaskColumnOptions = {
	onEdit?: (row: TaskFormValues, e: React.MouseEvent) => void;
	onDelete?: (row: TaskFormValues, e: React.MouseEvent) => void;
	onAdd?: () => void;
};

// タスクのフィルター処理
export const filterTask = (
	data: TaskFormValues[],
	searchQuery: string,
	statusFilter: string,
) => {
	let result = [...data];

	// 検索フィルタリング
	if (searchQuery) {
		result = result.filter((task) => {
			const searchableFields = [
				task.taskId,
				task.title,
				task.assignee,
				formatDate(task.dueDate, "yyyy/MM/dd"),
				getProgressLabel(task.progress),
			];
			return searchableFields.some((field) =>
				field?.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		});
	}

	// ステータスフィルタリング
	if (statusFilter !== "すべて") {
		result = result.filter((task) => {
			switch (task.progress) {
				case "pending":
					return statusFilter === "未着手";
				case "inProgress":
					return statusFilter === "進行中";
				default:
					return false;
			}
		});
	}

	return result;
};

export const getTaskStatusFilters = () => [
	"すべて",
	"未着手",
	"進行中",
];

export const renderTask = ({
	onEdit,
	onDelete,
	onAdd,
}: TaskColumnOptions): TableColumn<TaskFormValues>[] => [
	{
		key: "taskId",
		title: "タスクID",
		sortable: true,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => <span className="font-medium">{value}</span>,
	},
	{
		key: "title",
		title: "項目",
		sortable: true,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => <span className="font-medium">{value}</span>,
	},
	{
		key: "assignee",
		title: "担当者",
		sortable: false,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => <span>{value}</span>,
	},
	{
		key: "category",
		title: "カテゴリー",
		sortable: false,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => <span>{value || "-"}</span>,
	},
	{
		key: "startedAt",
		title: "起票日",
		sortable: true,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => (
			<span>{value ? formatDate(value, "yyyy/MM/dd") : "-"}</span>
		),
	},
	{
		key: "dueDate",
		title: "期限日",
		sortable: true,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => (
			<span>{value ? formatDate(value, "yyyy/MM/dd") : "-"}</span>
		),
	},
	{
		key: "progress",
		title: "進捗",
		sortable: true,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		render: (value: any) => {
			return (
				<Badge
					variant="outline"
					className={cn("font-normal text-white", getProgressColor(value))}
				>
					{getProgressIcon(value)}
					{getProgressLabel(value)}
				</Badge>
			);
		},
	},
	// {
	// 	key: "completedAt",
	// 	title: "完了日",
	// 	sortable: true,
	// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 	render: (value: any) => (
	// 		<span>{value ? formatDate(value, "yyyy/MM/dd") : "-"}</span>
	// 	),
	// },
	// {
	//   key: "isPublic",
	//   title: "公開",
	//   sortable: false,
	//   render: (value: any) => (
	//     <span>{value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
	//   ),
	// },

	...createTaskColumns({ onEdit, onDelete, onAdd }),
];

export const createTaskColumns = ({
	onEdit,
	onDelete,
	onAdd,
}: TaskColumnOptions): TableColumn<TaskFormValues>[] => [
	{
		key: "action",
		title: "操作",
		align: "right",
		render: (_, row) => (
			<div
				className="flex justify-end gap-2"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.stopPropagation();
					}
				}}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<span className="sr-only">メニューを開く</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>アクション</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onEdit?.(row, e);
							}}
						>
							<Pencil className="mr-2 h-4 w-4" />
							編集
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onDelete?.(row, e);
							}}
							className="text-red-600"
						>
							<Trash className="mr-2 h-4 w-4" />
							削除
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
	},
];
