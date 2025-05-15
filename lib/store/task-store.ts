import { create } from "zustand";

type SortOrder = "asc" | "desc";
type SortState = {
	key: string;
	order: SortOrder;
};

type TaskTableSortStore = {
	sort: SortState;
	setSort: (sort: SortState) => void;
};

export const useTaskTableSort = create<TaskTableSortStore>((set) => ({
	sort: { key: "taskId", order: "asc" }, // デフォルト
	setSort: (sort) => set({ sort }),
}));
