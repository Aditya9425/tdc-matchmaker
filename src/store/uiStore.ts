import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  isProfileModalOpen: boolean;
  isReviewMatchesOpen: boolean;
  isGenerateBriefOpen: boolean;
  isAnalyticsPanelOpen: boolean;
  isCopilotOpen: boolean;

  setSearchOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setReviewMatchesOpen: (open: boolean) => void;
  setGenerateBriefOpen: (open: boolean) => void;
  setAnalyticsPanelOpen: (open: boolean) => void;
  setCopilotOpen: (open: boolean) => void;
  
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isProfileModalOpen: false,
  isReviewMatchesOpen: false,
  isGenerateBriefOpen: false,
  isAnalyticsPanelOpen: false,
  isCopilotOpen: false,

  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setReviewMatchesOpen: (open) => set({ isReviewMatchesOpen: open }),
  setGenerateBriefOpen: (open) => set({ isGenerateBriefOpen: open }),
  setAnalyticsPanelOpen: (open) => set({ isAnalyticsPanelOpen: open }),
  setCopilotOpen: (open) => set({ isCopilotOpen: open }),

  closeAllModals: () => set({
    isSearchOpen: false,
    isProfileModalOpen: false,
    isReviewMatchesOpen: false,
    isGenerateBriefOpen: false,
    isAnalyticsPanelOpen: false,
    isCopilotOpen: false,
  })
}));
