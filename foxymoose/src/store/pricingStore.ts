import { create } from 'zustand';
import { PricingEditorState, Vendor, Rule, MatchingItem, VendorSummary } from '@/types';

interface PricingStore extends PricingEditorState {
  setSelectedVendor: (vendor: Vendor | null) => void;
  setRules: (rules: Rule[]) => void;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  setVendorSummary: (summary: VendorSummary[]) => void;
  setMatchingItems: (items: MatchingItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePricingStore = create<PricingStore>((set) => ({
  selectedVendor: null,
  rules: [],
  vendorSummary: [],
  matchingItems: [],
  isLoading: false,
  error: null,

  setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),
  setRules: (rules) => set({ rules }),
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (id, rule) => set((state) => ({
    rules: state.rules.map((r) => (r.id === id ? { ...r, ...rule } : r)),
  })),
  deleteRule: (id) => set((state) => ({
    rules: state.rules.filter((r) => r.id !== id),
  })),
  setVendorSummary: (summary) => set({ vendorSummary: summary }),
  setMatchingItems: (items) => set({ matchingItems: items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 