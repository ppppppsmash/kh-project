import { create } from "zustand";

type DisplayMode = "grid" | "list";

interface DisplayState {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
}

export const useDisplayStore = create<DisplayState>((set) => ({
  displayMode: "grid",
  setDisplayMode: (mode) => set({ displayMode: mode }),
}));
