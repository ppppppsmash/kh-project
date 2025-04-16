import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// クラスマージ
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// 日本日付フォーマット
export const formatDate = (date: string) => {
  const formattedDate = new Date(date).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  return formattedDate;
};

// テーブルページ総数
export const getTotalPages = <T>(filtered: T[], itemsPerPage: number) => {
  return Math.ceil(filtered.length / itemsPerPage);
};

// テーブルページネーション
export const getPaginated = <T>(filtered: T[], currentPage: number, itemsPerPage: number) => {
  return filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
};
