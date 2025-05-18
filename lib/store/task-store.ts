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

type TaskStatusStore = {
	activeTab: "active" | "completed";
	setActiveTab: (tab: "active" | "completed") => void;
};

export const useTaskStatus = create<TaskStatusStore>((set) => ({
	activeTab: "active",
	setActiveTab: (activeTab) => set({ activeTab }),
}));
