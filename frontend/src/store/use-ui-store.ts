import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
  sidebarCollapsed: boolean;
  activeWorkspaceId: string | null;
  commandMenuOpen: boolean;
  _hasHydrated: boolean;

  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        activeWorkspaceId: null,
        commandMenuOpen: false,
        _hasHydrated: false,

        setHasHydrated: (state) => set({ _hasHydrated: state }),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
        setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          activeWorkspaceId: state.activeWorkspaceId,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
        skipHydration: true,
      }
    ),
    { name: 'GlobalUIStore' }
  )
);
