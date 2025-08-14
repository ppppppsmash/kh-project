import { create } from "zustand";
import { addTab as addTabAction, deleteTab as deleteTabAction } from "@/actions/tabs";
import { CustomToast } from "@/components/ui/toast";

export type Tab = {
  id: string;
  name: string;
  type: "default" | "custom";
};

export type TabFilter = {
  id: string;
  name: string;
  isChecked: boolean;
};

interface TabStore {
  tabs: Tab[];
  activeTab: string;
  tabFilters: TabFilter[];
  addTab: (name: string) => Promise<void>;
  removeTab: (id: string) => Promise<void>;
  setActiveTab: (id: string) => void;
  setTabFilter: (id: string, isChecked: boolean) => void;
  resetTabFilters: () => void;
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [
    { id: "active", name: "未完了のタスク", type: "default" },
    { id: "in-progress", name: "進行中のタスク", type: "default" },
    { id: "completed", name: "完了したタスク", type: "default" },
  ],
  activeTab: "active",
  tabFilters: [
    { id: "active", name: "未完了のタスク", isChecked: true },
    { id: "in-progress", name: "進行中のタスク", isChecked: true },
    { id: "completed", name: "完了したタスク", isChecked: true },
  ],
  addTab: async (name: string) => {
    const result = await addTabAction(name);
    if (result.success && result.tab) {
      set((state) => ({
        tabs: [
          ...state.tabs,
          {
            id: result.tab.id,
            name: result.tab.name || name,
            type: "custom",
          },
        ],
        tabFilters: [
          ...state.tabFilters,
          {
            id: result.tab.id,
            name: result.tab.name || name,
            isChecked: true,
          },
        ],
      }));
    } else if (result.error) {
      CustomToast.error(result.error);
    }
  },
  removeTab: async (id: string) => {
    const result = await deleteTabAction(id);
    if (result.success) {
      set((state) => ({
        tabs: state.tabs.filter((tab) => tab.id !== id),
        tabFilters: state.tabFilters.filter((filter) => filter.id !== id),
        activeTab: state.activeTab === id ? "active" : state.activeTab,
      }));
    } else if (result.error) {
      CustomToast.error(result.error);
    }
  },
  setActiveTab: (id: string) => set({ activeTab: id }),
  setTabFilter: (id: string, isChecked: boolean) => 
    set((state) => ({
      tabFilters: state.tabFilters.map((filter) =>
        filter.id === id ? { ...filter, isChecked } : filter
      ),
    })),
  resetTabFilters: () => 
    set((state) => ({
      tabFilters: state.tabFilters.map((filter) => ({ ...filter, isChecked: true })),
    })),
}));
