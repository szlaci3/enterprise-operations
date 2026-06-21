import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  isMobileNavigationOpen: boolean
  closeMobileNavigation: () => void
  toggleMobileNavigation: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isMobileNavigationOpen: false,
      closeMobileNavigation: () => set({ isMobileNavigationOpen: false }),
      toggleMobileNavigation: () =>
        set((state) => ({
          isMobileNavigationOpen: !state.isMobileNavigationOpen,
        })),
    }),
    {
      name: 'enterprise-operations-ui',
      partialize: () => ({}),
    },
  ),
)
