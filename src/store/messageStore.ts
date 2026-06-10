/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import type { Conversation, Message } from '@/types';
import {
  getConversations as fbGetConversations,
  createConversation as fbCreateConversation,
  sendMessage as fbSendMessage,
  getMessages as fbGetMessages,
  subscribeToConversations,
  subscribeToMessages,
} from '@/firebase/messages';
import toast from 'react-hot-toast';

interface MessageState {
  conversations: Conversation[];
  activeMessages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    data: Omit<Message, 'id'>
  ) => Promise<void>;
  createConversation: (
    data: Omit<Conversation, 'id'>
  ) => Promise<string | null>;
  setActiveConversation: (id: string | null) => void;
  subscribeConversations: () => () => void;
  subscribeMessages: (conversationId: string) => () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeMessages: [],
  activeConversationId: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await fbGetConversations();
      set({ conversations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error('Failed to load conversations');
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    try {
      const activeMessages = await fbGetMessages(conversationId);
      set({ activeMessages, activeConversationId: conversationId, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      toast.error('Failed to load messages');
    }
  },

  sendMessage: async (conversationId, data) => {
    try {
      await fbSendMessage(conversationId, data);
    } catch (err: any) {
      toast.error('Failed to send message');
    }
  },

  createConversation: async (data) => {
    try {
      const id = await fbCreateConversation(data);
      toast.success('Conversation created');
      await get().fetchConversations();
      return id;
    } catch (err: any) {
      toast.error('Failed to create conversation');
      return null;
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  subscribeConversations: () => {
    return subscribeToConversations((conversations) => {
      set({ conversations });
    });
  },

  subscribeMessages: (conversationId) => {
    return subscribeToMessages(conversationId, (activeMessages) => {
      set({ activeMessages });
    });
  },
}));
