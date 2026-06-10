/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import type { Customer, CustomerStatus, AIFilters } from '@/types';
import {
  getCustomers as fbGetCustomers,
  getCustomerById as fbGetCustomerById,
  createCustomer as fbCreateCustomer,
  updateCustomer as fbUpdateCustomer,
  deleteCustomer as fbDeleteCustomer,
  subscribeToCustomers,
  addToShortlist as fbAddToShortlist,
} from '@/firebase/customers';
import { parseFilterQuery, fallbackParseQuery } from '@/services/ai/customerFilterService';
import toast from 'react-hot-toast';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  detailedCustomersCache: Record<string, Customer>;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: CustomerStatus | 'All';

  // AI Filtering
  aiFilters: AIFilters;
  isParsingQuery: boolean;
  aiFilterConfidence: number;

  fetchCustomers: () => Promise<void>;
  fetchDetailedCustomer: (id: string) => Promise<void>;
  fetchCustomerById: (id: string) => Promise<Customer | undefined>;
  createCustomer: (data: Omit<Customer, 'id'>) => Promise<string | null>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addToShortlist: (id: string) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: CustomerStatus | 'All') => void;
  subscribe: () => () => void;
  getFilteredCustomers: () => Customer[];

  // AI Filter actions
  parseAndApplyAIFilter: (query: string) => Promise<void>;
  removeAiFilter: (key: keyof AIFilters) => void;
  clearAiFilters: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  detailedCustomersCache: {},
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  searchQuery: '',
  statusFilter: 'All',

  // AI Filtering
  aiFilters: {},
  isParsingQuery: false,
  aiFilterConfidence: 0,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const customers = await fbGetCustomers();
      set({ customers, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error('Failed to load customers');
    }
  },

  fetchDetailedCustomer: async (id: string) => {
    const { detailedCustomersCache } = get();
    if (detailedCustomersCache[id]) {
      set({ selectedCustomer: detailedCustomersCache[id], isLoadingDetails: false });
      return;
    }
    
    set({ isLoadingDetails: true });
    try {
      const customer = await fbGetCustomerById(id);
      if (customer) {
        set((state) => ({
          detailedCustomersCache: { ...state.detailedCustomersCache, [id]: customer },
          selectedCustomer: customer,
          isLoadingDetails: false
        }));
      } else {
        set({ isLoadingDetails: false });
      }
    } catch (err: any) {
      toast.error('Failed to load detailed customer profile');
      set({ isLoadingDetails: false });
    }
  },

  fetchCustomerById: async (id: string) => {
    try {
      const customer = await fbGetCustomerById(id);
      if (customer) {
        set({ selectedCustomer: customer });
      }
      return customer;
    } catch (err: any) {
      toast.error('Failed to load customer');
      return undefined;
    }
  },

  addToShortlist: async (id: string) => {
    try {
      await fbAddToShortlist(id);
      toast.success('Added to shortlist');
    } catch (err: any) {
      toast.error('Failed to add to shortlist');
    }
  },

  createCustomer: async (data) => {
    try {
      const id = await fbCreateCustomer(data);
      toast.success('Customer created');
      await get().fetchCustomers();
      return id;
    } catch (err: any) {
      toast.error('Failed to create customer');
      return null;
    }
  },

  updateCustomer: async (id, data) => {
    try {
      await fbUpdateCustomer(id, data);
      toast.success('Customer updated');
      await get().fetchCustomers();
    } catch (err: any) {
      toast.error('Failed to update customer');
    }
  },

  deleteCustomer: async (id) => {
    try {
      await fbDeleteCustomer(id);
      toast.success('Customer deleted');
      set((s) => ({
        customers: s.customers.filter((c) => c.id !== id),
        selectedCustomer:
          s.selectedCustomer?.id === id ? null : s.selectedCustomer,
      }));
    } catch (err: any) {
      toast.error('Failed to delete customer');
    }
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  // AI Filter actions
  parseAndApplyAIFilter: async (query: string) => {
    if (!query.trim()) return;
    set({ isParsingQuery: true, searchQuery: query });
    try {
      const result = await parseFilterQuery(query);
      set({
        aiFilters: result.filters,
        aiFilterConfidence: result.confidence,
        isParsingQuery: false,
        statusFilter: 'All', // Reset status tab when AI filter is active
      });
    } catch {
      // Ultimate fallback: regex
      const result = fallbackParseQuery(query);
      set({
        aiFilters: result.filters,
        aiFilterConfidence: result.confidence,
        isParsingQuery: false,
        statusFilter: 'All',
      });
    }
  },

  removeAiFilter: (key) => {
    set((state) => {
      const newFilters = { ...state.aiFilters };
      delete newFilters[key];
      const hasFilters = Object.keys(newFilters).length > 0;
      return {
        aiFilters: newFilters,
        aiFilterConfidence: hasFilters ? state.aiFilterConfidence : 0,
        searchQuery: hasFilters ? state.searchQuery : '',
      };
    });
  },

  clearAiFilters: () => {
    set({ aiFilters: {}, aiFilterConfidence: 0, searchQuery: '' });
  },

  subscribe: () => {
    return subscribeToCustomers((customers) => {
      set({ customers });
    });
  },

  getFilteredCustomers: () => {
    const { customers, searchQuery, statusFilter, aiFilters } = get();
    let result = customers;

    const hasAiFilters = Object.keys(aiFilters).length > 0;

    // If AI filters are active, use them exclusively
    if (hasAiFilters) {
      if (aiFilters.gender) {
        result = result.filter(c => c.gender === aiFilters.gender);
      }
      if (aiFilters.minAge != null) {
        result = result.filter(c => c.age >= aiFilters.minAge!);
      }
      if (aiFilters.maxAge != null) {
        result = result.filter(c => c.age <= aiFilters.maxAge!);
      }
      if (aiFilters.city) {
        result = result.filter(c => c.city?.toLowerCase().includes(aiFilters.city!.toLowerCase()));
      }
      if (aiFilters.state) {
        result = result.filter(c => c.state?.toLowerCase().includes(aiFilters.state!.toLowerCase()));
      }
      if (aiFilters.status) {
        result = result.filter(c => c.status === aiFilters.status);
      }
      if (aiFilters.verified !== undefined) {
        result = result.filter(c => c.verified === aiFilters.verified);
      }
      if (aiFilters.minCompatibility != null) {
        result = result.filter(c => (c.matchPotential || c.aiScore || 0) >= aiFilters.minCompatibility!);
      }
      if (aiFilters.profession) {
        result = result.filter(c =>
          (c.designation || c.profession || '')
            .toLowerCase()
            .includes(aiFilters.profession!.toLowerCase())
        );
      }
      if (aiFilters.religion) {
        result = result.filter(c => c.religion?.toLowerCase() === aiFilters.religion!.toLowerCase());
      }
      return result;
    }

    // Fallback: basic text search when no AI filters are active
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          (c.profession && c.profession.toLowerCase().includes(q)) ||
          c.status?.toLowerCase().includes(q) ||
          c.religion?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  },
}));

