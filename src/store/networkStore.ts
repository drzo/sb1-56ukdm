import { create } from 'zustand';
import { NetworkState, ViewConfig } from '../types/network';

interface Store {
  network: NetworkState;
  viewConfig: ViewConfig;
  setNetwork: (network: NetworkState) => void;
  setViewConfig: (config: ViewConfig) => void;
  selectNode: (nodeId: string | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

export const useNetworkStore = create<Store>((set) => ({
  network: {
    nodes: [],
    links: []
  },
  viewConfig: {
    zoom: 1,
    centerX: 0,
    centerY: 0,
    selectedNode: null
  },
  setNetwork: (network) => set({ network }),
  setViewConfig: (config) => set({ viewConfig: config }),
  selectNode: (nodeId) => set((state) => ({
    viewConfig: { ...state.viewConfig, selectedNode: nodeId }
  })),
  zoomIn: () => set((state) => ({
    viewConfig: { ...state.viewConfig, zoom: Math.min(state.viewConfig.zoom * 1.2, 3) }
  })),
  zoomOut: () => set((state) => ({
    viewConfig: { ...state.viewConfig, zoom: Math.max(state.viewConfig.zoom / 1.2, 0.3) }
  })),
  resetView: () => set((state) => ({
    viewConfig: { ...state.viewConfig, zoom: 1, centerX: 0, centerY: 0 }
  }))
}));