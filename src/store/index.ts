import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CurrencyMode, DashboardFilterValue, DashboardFilters, ViewMode } from '../types';
import { normalizeDashboardFilters } from '../selectors/filtering';

export type BrandMode = 'default' | 'siemens-energy';

interface AppState {
  // Branding
  brandMode: BrandMode;
  setBrandMode: (mode: BrandMode) => void;
  toggleBrandMode: () => void;

  // Authentication
  isAuthenticated: boolean;
  userName: string;
  login: (userName: string) => void;
  logout: () => void;

  // Navigation
  sidebarViewMode: ViewMode;
  activeFilters: DashboardFilters;
  setSidebarViewMode: (mode: ViewMode) => void;
  toggleFilter: (filter: DashboardFilterValue) => void;
  removeFilter: (filter: DashboardFilterValue) => void;
  setFilters: (filters: DashboardFilters) => void;
  clearFilters: () => void;

  // Mobile sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Positions
  currencyMode: CurrencyMode;
  setCurrencyMode: (mode: CurrencyMode) => void;
}

function filtersMatch(a: DashboardFilterValue, b: DashboardFilterValue): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'region':
      return b.kind === 'region' && a.region === b.region;
    case 'country':
      return b.kind === 'country' && a.countryCode === b.countryCode;
    case 'entity':
      return b.kind === 'entity' && a.areCode === b.areCode;
    case 'bankingPartner':
      return b.kind === 'bankingPartner' && a.bank === b.bank;
  }
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Branding
      brandMode: 'siemens-energy',
      setBrandMode: (mode) => set({ brandMode: mode }),
      toggleBrandMode: () =>
        set((state) => ({
          brandMode: state.brandMode === 'default' ? 'siemens-energy' : 'default',
        })),

      // Authentication
      isAuthenticated: false,
      userName: '',
      login: (userName) => set({ isAuthenticated: true, userName }),
      logout: () => set({ isAuthenticated: false, userName: '' }),

      // Navigation
      sidebarViewMode: 'region',
      activeFilters: [],
      setSidebarViewMode: (mode) => set({ sidebarViewMode: mode }),
      toggleFilter: (filter) =>
        set((s) => {
          const exists = s.activeFilters.some((f) => filtersMatch(f, filter));
          return {
            activeFilters: normalizeDashboardFilters(
              exists
                ? s.activeFilters.filter((f) => !filtersMatch(f, filter))
                : [...s.activeFilters, filter],
            ),
          };
        }),
      removeFilter: (filter) =>
        set((s) => ({
          activeFilters: normalizeDashboardFilters(s.activeFilters.filter((f) => !filtersMatch(f, filter))),
        })),
      setFilters: (filters) => set({ activeFilters: normalizeDashboardFilters(filters) }),
      clearFilters: () => set({ activeFilters: [] }),

      // Mobile sidebar
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),

      // Positions
      currencyMode: 'EUR',
      setCurrencyMode: (mode) => set({ currencyMode: mode }),
    }),
    {
      name: 'se-treasury-platform-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        brandMode: state.brandMode,
        isAuthenticated: state.isAuthenticated,
        userName: state.userName,
      }),
    },
  ),
);
