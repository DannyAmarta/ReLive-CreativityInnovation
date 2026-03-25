import { create } from "zustand";

type WorldPhase = "intro" | "revealing" | "village";

interface WorldState {
  phase: WorldPhase;
  activeSpot: number | null;
  showProfile: boolean;
  radialMenuOpen: boolean;
  setPhase: (phase: WorldPhase) => void;
  setActiveSpot: (spotId: number | null) => void;
  setShowProfile: (show: boolean) => void;
  setRadialMenuOpen: (open: boolean) => void;
  resetCamera: () => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  phase: "intro",
  activeSpot: null,
  showProfile: false,
  radialMenuOpen: false,

  setPhase: (phase) => set({ phase }),
  setActiveSpot: (activeSpot) => set({ activeSpot }),
  setShowProfile: (showProfile) => set({ showProfile }),
  setRadialMenuOpen: (radialMenuOpen) => set({ radialMenuOpen }),
  resetCamera: () => set({ activeSpot: null }),
}));
