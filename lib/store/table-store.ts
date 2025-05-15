import { create } from "zustand";

interface TableState {
	itemsPerPage: number;
	setItemsPerPage: (itemsPerPage: number) => void;
}

export const useTableStore = create<TableState>((set) => ({
	itemsPerPage: 10,
	setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
}));

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50];
