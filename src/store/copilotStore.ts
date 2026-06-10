import { create } from 'zustand';

export interface CopilotAction {
  type: string;
  payload?: any;
  label: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: CopilotAction[];
  sources?: string[];
}

interface CopilotState {
  messages: CopilotMessage[];
  isGenerating: boolean;
  
  addMessage: (msg: CopilotMessage) => void;
  setGenerating: (val: boolean) => void;
  clearMessages: () => void;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [{
    id: 'welcome-msg',
    role: 'assistant',
    content: "Hi! I'm your TDC Intelligence Center Copilot. I have access to your customers, matches, calendar, and analytics. How can I help you today?",
  }],
  isGenerating: false,
  
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setGenerating: (val) => set({ isGenerating: val }),
  clearMessages: () => set({ messages: [{
    id: 'welcome-msg-reset',
    role: 'assistant',
    content: "Hi! I'm your TDC Intelligence Center Copilot. I have access to your customers, matches, calendar, and analytics. How can I help you today?",
  }] }),
}));
