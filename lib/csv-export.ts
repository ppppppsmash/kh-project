import { formatDate } from "@/lib/utils";
import { getProgressLabel } from "@/lib/utils";
import type { TaskFormValues } from "@/lib/validations";
import type { CategoryValues } from "@/lib/validations";

export const exportTasksToCSV = (
	tasks: TaskFormValues[],
	categories: CategoryValues[],
	filename = "tasks.csv"
) => {
	// CSVヘッダー
	const headers = [
		"タスクID",
		"項目",
		"担当者",
		"カテゴリー",
		"起票日",
		"期限日",
		"進捗",
		"内容",
    "進捗状況・対応内容",
    "リンク先",
    "備考"
	];

	// データ行を生成
	const rows = tasks.map(task => {
		const category = categories.find(cat => cat.id === task.categoryId);
		return [
			task.taskId || "",
			task.title || "",
			task.assignee || "",
			category?.name || "",
			task.startedAt ? formatDate(task.startedAt, "yyyy/MM/dd") : "",
			task.dueDate ? formatDate(task.dueDate, "yyyy/MM/dd") : "",
			getProgressLabel(task.progress) || "",
			task.content || "",
      task.progressDetails || "",
      task.link || "",
      task.notes || ""
		];
	});

	// CSVコンテンツを生成
	const csvContent = [
		headers.join(","),
		...rows.map(row => row.map(cell => `"${cell}"`).join(","))
	].join("\n");

	// BOMを追加してUTF-8でエンコード
	const BOM = "\uFEFF";
	const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

	// ダウンロードリンクを作成
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const exportFilteredTasksToCSV = (
	tasks: TaskFormValues[],
	categories: CategoryValues[],
	searchQuery = "",
	statusFilter = "すべて",
	filename?: string
) => {
	// フィルタリング処理（TaskItem.tsxのfilterTask関数と同様）
	let filteredTasks = [...tasks];

	// 検索フィルタリング
	if (searchQuery) {
		filteredTasks = filteredTasks.filter((task) => {
			const searchableFields = [
				task.taskId,
				task.title,
				task.assignee,
				formatDate(task.dueDate, "yyyy/MM/dd"),
				getProgressLabel(task.progress),
        task.progressDetails,
        task.link,
        task.notes
			];
			return searchableFields.some((field) =>
				field?.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		});
	}

	// ステータスフィルタリング
	if (statusFilter !== "すべて") {
		filteredTasks = filteredTasks.filter((task) => {
			switch (task.progress) {
				case "pending":
					return statusFilter === "未着手";
				case "inProgress":
					return statusFilter === "進行中";
				case "completed":
					return statusFilter === "完了";
				default:
					return false;
			}
		});
	}

	// ファイル名を生成
	const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const defaultFilename = `tasks_${timestamp}.csv`;
	
	exportTasksToCSV(filteredTasks, categories, filename || defaultFilename);
};
