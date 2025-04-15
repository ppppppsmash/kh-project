import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatDate = (date: string) => {
  const formattedDate = new Date(date).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  return formattedDate;
};
