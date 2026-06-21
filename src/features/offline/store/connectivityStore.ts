import { create } from 'zustand'

interface ConnectivityState {
  browserOnline: boolean
  forcedOffline: boolean
  setBrowserOnline: (online: boolean) => void
  setForcedOffline: (offline: boolean) => void
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  browserOnline:
    typeof navigator === 'undefined' ? true : navigator.onLine,
  forcedOffline: false,
  setBrowserOnline: (browserOnline) => set({ browserOnline }),
  setForcedOffline: (forcedOffline) => set({ forcedOffline }),
}))

export function connectionIsOnline() {
  const state = useConnectivityStore.getState()
  return state.browserOnline && !state.forcedOffline
}
