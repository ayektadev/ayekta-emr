import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'ayekta-chart-density';

interface ChartDensityState {
  density: ChartDensity;
  setDensity: (d: ChartDensity) => void;
}

export const useChartDensityStore = create<ChartDensityState>()(
  persist(
    (set) => ({
      density: 'comfortable',
      setDensity: (density) => {
        set({ density });
        try {
          document.documentElement.dataset.chartDensity = density;
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ density: s.density }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          document.documentElement.dataset.chartDensity = state.density;
        } catch {
          /* ignore */
        }
      },
    }
  )
);
