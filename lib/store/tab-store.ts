import { create } from "zustand";

export type Tab = {
  id: string;
  name: string;
  type: "default" | "custom";
};

interface TabStore {
  tabs: Tab[];
  activeTab: string;
  addTab: (name: string) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [
    { id: "active", name: "未完了のタスク", type: "default" },
    { id: "completed", name: "完了したタスク", type: "default" },
  ],
  activeTab: "active",
  addTab: (name: string) =>
    set((state) => ({
      tabs: [
        ...state.tabs,
        {
          id: `custom-${Date.now()}`,
          name,
          type: "custom",
        },
      ],
    })),
  removeTab: (id: string) =>
    set((state) => ({
      tabs: state.tabs.filter((tab) => tab.id !== id),
      activeTab: state.activeTab === id ? "active" : state.activeTab,
    })),
  setActiveTab: (id: string) => set({ activeTab: id }),
}));
