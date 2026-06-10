import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  selectedCustomerId: string | null;
  selectedConversationId: string | null;
  selectedMatchCustomerId: string | null;
  searchQuery: string;
  activeTab: string;
  isMobile: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedConversationId: (id: string | null) => void;
  setSelectedMatchCustomerId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  selectedCustomerId: null,
  selectedConversationId: null,
  selectedMatchCustomerId: null,
  searchQuery: '',
  activeTab: 'snapshot',
  isMobile: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  setSelectedMatchCustomerId: (id) => set({ selectedMatchCustomerId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));
