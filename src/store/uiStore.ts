import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

interface UiState {
  isMobileNavigationOpen: boolean
  theme: ThemePreference
  closeMobileNavigation: () => void
  setTheme: (theme: ThemePreference) => void
  toggleMobileNavigation: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isMobileNavigationOpen: false,
      theme: 'system',
      closeMobileNavigation: () => set({ isMobileNavigationOpen: false }),
      setTheme: (theme) => set({ theme }),
      toggleMobileNavigation: () =>
        set((state) => ({
          isMobileNavigationOpen: !state.isMobileNavigationOpen,
        })),
    }),
    {
      name: 'enterprise-operations-ui',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
