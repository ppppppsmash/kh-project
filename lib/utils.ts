import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
// クラスマージ
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// 日本日付フォーマット
export const formatDate = (date: Date, formatString: string) => {
  return format(date, formatString, { locale: ja });
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
