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

// タスク用のCSVエクスポート関数
export const exportTasksToCSV = (
	tasks: TaskFormValues[],
	categories: CategoryValues[],
	filename = "tasks.csv"
) => {
	// CSVヘッダー
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

	// データ行を生成
	const rows = tasks.map(task => {
		const category = categories.find(cat => cat.id === task.categoryId);
		const priorityLabel = task.priority === "high" ? "高" : 
			task.priority === "medium" ? "中" : 
			task.priority === "low" ? "低" : 
			task.priority === "none" ? "未設定" : "未設定";
		
		// 各フィールドの値を安全に取得し、空文字列に変換
		const taskId = task.taskId || "";
		const title = task.title || "";
		const content = task.content || "";
		const assignee = task.assignee || "";
		const categoryName = category?.name || "";
		const startedAt = task.startedAt ? formatDate(task.startedAt, "yyyy/MM/dd") : "";
		const dueDate = task.dueDate ? formatDate(task.dueDate, "yyyy/MM/dd") : "";
		const progress = getProgressLabel(task.progress) || "";
		const progressDetails = task.progressDetails || "";
		const link = task.link || "";
		const notes = task.notes || "";
		const completedAt = task.completedAt ? formatDate(task.completedAt, "yyyy/MM/dd") : "";
		
		return [
			taskId,
			title,
			content,
			assignee,
			priorityLabel,
			categoryName,
			startedAt,
			dueDate,
			progress,
			progressDetails,
			link,
			notes,
			completedAt
		];
	});

	exportToCSV(headers, rows, filename);
};

// QA用のCSVエクスポート関数
export const exportQaToCSV = (
	qaItems: QaFormValues[],
	filename = "qa.csv"
) => {
	// CSVヘッダー
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

	// データ行を生成
	const rows = qaItems.map(item => {
		// 各フィールドの値を安全に取得し、空文字列に変換
		const questionCode = item.questionCode || "";
		const question = item.question || "";
		const answer = item.answer || "";
		const category = item.category || "";
		const questionBy = item.questionBy || "";
		const answeredBy = item.answeredBy || "";
		const isPublic = item.isPublic ? "公開" : "非公開";
		const startedAt = item.startedAt ? formatDate(item.startedAt, "yyyy/MM/dd") : "";
		const createdAt = item.createdAt ? formatDate(item.createdAt, "yyyy/MM/dd") : "";
		const updatedAt = item.updatedAt ? formatDate(item.updatedAt, "yyyy/MM/dd") : "";
		
		return [
			questionCode,
			question,
			answer,
			category,
			questionBy,
			answeredBy,
			isPublic,
			startedAt,
			createdAt,
			updatedAt
		];
	});

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
	// フィルタリング処理（TaskItem.tsxのfilterTask関数と同様）
	let filteredTasks = [...tasks];

	// 検索フィルタリング
	if (searchQuery) {
		filteredTasks = filteredTasks.filter((task) => {
			const searchableFields = [
				task.taskId || "",
				task.title || "",
				task.content || "",
				task.assignee || "",
				task.priority === "high" ? "高" : 
					task.priority === "medium" ? "中" : 
					task.priority === "low" ? "低" : 
					task.priority === "none" ? "未設定" : "未設定",
				task.dueDate ? formatDate(task.dueDate, "yyyy/MM/dd") : "",
				getProgressLabel(task.progress) || "",
				task.progressDetails || "",
				task.link || "",
				task.notes || ""
			];
			return searchableFields.some((field) =>
				field.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		});
	}

	// ステータスフィルタリング
	if (statusFilter !== "進捗状況:すべて") {
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

	// 優先度フィルタリング
	if (priorityFilter !== "優先度:すべて") {
		filteredTasks = filteredTasks.filter((task) => {
			switch (task.priority) {
				case "high":
					return priorityFilter === "高";
				case "medium":
					return priorityFilter === "中";
				case "low":
					return priorityFilter === "低";
				case "none":
				case undefined:
					return priorityFilter === "未設定";
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

// フィルタリングされたQAのCSVエクスポート
export const exportFilteredQaToCSV = (
	qaItems: QaFormValues[],
	searchQuery = "",
	categoryFilter = "全て",
	filename?: string
) => {
	// フィルタリング処理
	let filteredQa = [...qaItems];

	// 検索フィルタリング
	if (searchQuery) {
		filteredQa = filteredQa.filter((item) => {
			const searchableFields = [
				item.questionCode || "",
				item.question || "",
				item.answer || "",
				item.category || "",
				item.questionBy || "",
				item.answeredBy || ""
			];
			return searchableFields.some((field) =>
				field.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		});
	}

	// カテゴリフィルタリング
	if (categoryFilter !== "全て") {
		filteredQa = filteredQa.filter((item) => 
			(item.category || "").toLowerCase().includes(categoryFilter.toLowerCase())
		);
	}

	// ファイル名を生成
	const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const defaultFilename = `qa_${timestamp}.csv`;
	
	exportQaToCSV(filteredQa, filename || defaultFilename);
};
