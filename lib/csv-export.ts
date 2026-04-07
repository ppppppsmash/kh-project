import { formatDate } from "@/lib/utils";
import { getProgressLabel } from "@/lib/utils";
import type { TaskFormValues, QaFormValues } from "@/lib/validations";
import type { CategoryValues } from "@/lib/validations";

// 共通のCSVエクスポート関数
export const exportToCSV = (
	headers: string[],
	rows: string[][],
	filename = "export.csv"
) => {
	// CSVコンテンツを生成
	const csvContent = [
		headers.join(","),
		...rows.map(row =>
			row.map(cell => {
				// セルの値を安全に処理
				const safeCell = String(cell || "").replace(/"/g, '""');
				return `"${safeCell}"`;
			}).join(",")
		)
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

// 共通: 検索クエリでフィルタリング
const filterBySearch = <T>(
	items: T[],
	searchQuery: string,
	getSearchableFields: (item: T) => string[]
): T[] => {
	if (!searchQuery) return items;
	const query = searchQuery.toLowerCase();
	return items.filter((item) =>
		getSearchableFields(item).some((field) =>
			field.toLowerCase().includes(query),
		),
	);
};

// 共通: タイムスタンプ付きファイル名を生成
const generateFilename = (prefix: string, filename?: string): string => {
	if (filename) return filename;
	const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	return `${prefix}_${timestamp}.csv`;
};

// タスク用のCSVエクスポート関数
const exportTasksToCSV = (
	tasks: TaskFormValues[],
	categories: CategoryValues[],
	filename = "tasks.csv"
) => {
	const headers = [
		"タスクID",
		"項目",
		"内容",
		"担当者",
		"優先度",
		"カテゴリー",
		"起票日",
		"期限日",
		"進捗",
		"進捗状況・対応内容",
		"リンク先",
		"備考",
		"完了日"
	];

	const rows = tasks.map(task => {
		const category = categories.find(cat => cat.id === task.categoryId);
		const priorityLabel = task.priority === "high" ? "高" :
			task.priority === "medium" ? "中" :
			task.priority === "low" ? "低" : "未設定";

		return [
			task.taskId || "",
			task.title || "",
			task.content || "",
			task.assignee || "",
			priorityLabel,
			category?.name || "",
			task.startedAt ? formatDate(task.startedAt, "yyyy/MM/dd") : "",
			task.dueDate ? formatDate(task.dueDate, "yyyy/MM/dd") : "",
			getProgressLabel(task.progress) || "",
			task.progressDetails || "",
			task.link || "",
			task.notes || "",
			task.completedAt ? formatDate(task.completedAt, "yyyy/MM/dd") : "",
		];
	});

	exportToCSV(headers, rows, filename);
};

// QA用のCSVエクスポート関数
const exportQaToCSV = (
	qaItems: QaFormValues[],
	filename = "qa.csv"
) => {
	const headers = [
		"質問コード",
		"質問",
		"回答",
		"カテゴリー",
		"質問者",
		"回答者",
		"公開設定",
		"起票日",
		"作成日",
		"更新日"
	];

	const rows = qaItems.map(item => [
		item.questionCode || "",
		item.question || "",
		item.answer || "",
		item.category || "",
		item.questionBy || "",
		item.answeredBy || "",
		item.isPublic ? "公開" : "非公開",
		item.startedAt ? formatDate(item.startedAt, "yyyy/MM/dd") : "",
		item.createdAt ? formatDate(item.createdAt, "yyyy/MM/dd") : "",
		item.updatedAt ? formatDate(item.updatedAt, "yyyy/MM/dd") : "",
	]);

	exportToCSV(headers, rows, filename);
};

// フィルタリングされたタスクのCSVエクスポート
export const exportFilteredTasksToCSV = (
	tasks: TaskFormValues[],
	categories: CategoryValues[],
	searchQuery = "",
	statusFilter = "進捗状況:すべて",
	priorityFilter = "優先度:すべて",
	filename?: string
) => {
	let filtered = filterBySearch(tasks, searchQuery, (task) => [
		task.taskId || "",
		task.title || "",
		task.content || "",
		task.assignee || "",
		task.priority === "high" ? "高" :
			task.priority === "medium" ? "中" :
			task.priority === "low" ? "低" : "未設定",
		task.dueDate ? formatDate(task.dueDate, "yyyy/MM/dd") : "",
		getProgressLabel(task.progress) || "",
		task.progressDetails || "",
		task.link || "",
		task.notes || "",
	]);

	// ステータスフィルタリング
	if (statusFilter !== "進捗状況:すべて") {
		const statusMap: Record<string, string> = {
			pending: "未着手",
			inProgress: "進行中",
			completed: "完了",
		};
		filtered = filtered.filter(
			(task) => statusMap[task.progress] === statusFilter,
		);
	}

	// 優先度フィルタリング
	if (priorityFilter !== "優先度:すべて") {
		const priorityMap: Record<string, string> = {
			high: "高",
			medium: "中",
			low: "低",
			none: "未設定",
		};
		filtered = filtered.filter(
			(task) => priorityMap[task.priority || "none"] === priorityFilter,
		);
	}

	exportTasksToCSV(filtered, categories, generateFilename("tasks", filename));
};

// フィルタリングされたQAのCSVエクスポート
export const exportFilteredQaToCSV = (
	qaItems: QaFormValues[],
	searchQuery = "",
	categoryFilter = "全て",
	filename?: string
) => {
	let filtered = filterBySearch(qaItems, searchQuery, (item) => [
		item.questionCode || "",
		item.question || "",
		item.answer || "",
		item.category || "",
		item.questionBy || "",
		item.answeredBy || "",
	]);

	// カテゴリフィルタリング
	if (categoryFilter !== "全て") {
		filtered = filtered.filter((item) =>
			(item.category || "").toLowerCase().includes(categoryFilter.toLowerCase())
		);
	}

	exportQaToCSV(filtered, generateFilename("qa", filename));
};
