import type { TaskFormValues } from "@/lib/validations";
import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

// クラスマージ
export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

// 日本日付フォーマット
export const formatDate = (date: Date, formatString: string) => {
	return format(date, formatString, { locale: ja });
};

// 日付フォーマット(YYYY-MM-DD) for Input
export const formatDateForInput = (date: Date | null | undefined): string => {
	if (!date) return "";
	return date.toISOString().split("T")[0];
};

// テーブルページ総数
export const getTotalPages = <T>(filtered: T[], itemsPerPage: number) => {
	return Math.ceil(filtered.length / itemsPerPage);
};

// テーブルページネーション
export const getPaginated = <T>(
	filtered: T[],
	currentPage: number,
	itemsPerPage: number,
) => {
	return filtered.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);
};

// タスク進捗色
export const getProgressColor = (progress: TaskFormValues["progress"]) => {
	switch (progress) {
		case "pending":
			return "bg-gray-500";
		case "inProgress":
			return "bg-blue-500";
		case "completed":
			return "bg-green-500";
		default:
			return "bg-gray-500";
	}
};

// タスク進捗ラベル
export const getProgressLabel = (progress: TaskFormValues["progress"]) => {
	switch (progress) {
		case "pending":
			return "未着手";
		case "inProgress":
			return "進行中";
		case "completed":
			return "完了";
		default:
			return "未着手";
	}
};
