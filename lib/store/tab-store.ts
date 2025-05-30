import { create } from "zustand";
import { addTab as addTabAction, deleteTab as deleteTabAction } from "@/actions/tabs";
import { CustomToast } from "@/components/ui/toast";

export type Tab = {
  id: string;
  name: string;
  type: "default" | "custom";
};

interface TabStore {
  tabs: Tab[];
  activeTab: string;
  addTab: (name: string) => Promise<void>;
  removeTab: (id: string) => Promise<void>;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [
    { id: "active", name: "未完了のタスク", type: "default" },
    { id: "completed", name: "完了したタスク", type: "default" },
  ],
  activeTab: "active",
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
        activeTab: state.activeTab === id ? "active" : state.activeTab,
      }));
    } else if (result.error) {
      CustomToast.error(result.error);
    }
  },
  setActiveTab: (id: string) => set({ activeTab: id }),
}));
