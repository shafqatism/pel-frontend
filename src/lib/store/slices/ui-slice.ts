import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  fleetDrawer: {
    isOpen: boolean;
    type: 'vehicle' | 'trip' | 'fuel' | 'maintenance' | 'assignment' | null;
    data: any | null;
    mode: 'create' | 'edit';
  };
  globalAnalytics: {
    isOpen: boolean;
    module: 'fleet' | 'hr' | 'finance' | 'hse' | 'sites' | 'food' | 'rental' | 'documents' | 'dashboard' | 'projects' | 'companies' | null;
    type: string | null;
  };
  globalHelp: {
    isOpen: boolean;
    module: 'fleet' | 'hr' | 'finance' | 'hse' | 'sites' | 'food' | 'rental' | 'documents' | 'dashboard' | 'projects' | 'companies' | null;
    section: string | null;
  };
}

const initialState: UIState = {
  fleetDrawer: {
    isOpen: false,
    type: null,
    data: null,
    mode: 'create',
  },
  globalAnalytics: {
    isOpen: false,
    module: null,
    type: null,
  },
  globalHelp: {
    isOpen: false,
    module: null,
    section: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openFleetDrawer: (state, action: PayloadAction<{ type: UIState['fleetDrawer']['type']; data?: any; mode?: 'create' | 'edit' }>) => {
      state.fleetDrawer.isOpen = true;
      state.fleetDrawer.type = action.payload.type;
      state.fleetDrawer.data = action.payload.data || null;
      state.fleetDrawer.mode = action.payload.mode || 'create';
    },
    closeFleetDrawer: (state) => {
      state.fleetDrawer.isOpen = false;
      state.fleetDrawer.type = null;
      state.fleetDrawer.data = null;
    },
    openGlobalAnalytics: (state, action: PayloadAction<{ module: UIState['globalAnalytics']['module']; type: string }>) => {
      state.globalAnalytics.isOpen = true;
      state.globalAnalytics.module = action.payload.module;
      state.globalAnalytics.type = action.payload.type;
    },
    closeGlobalAnalytics: (state) => {
      state.globalAnalytics.isOpen = false;
      state.globalAnalytics.module = null;
      state.globalAnalytics.type = null;
    },
    openGlobalHelp: (state, action: PayloadAction<{ module: UIState['globalHelp']['module']; section: string }>) => {
      state.globalHelp.isOpen = true;
      state.globalHelp.module = action.payload.module;
      state.globalHelp.section = action.payload.section;
    },
    closeGlobalHelp: (state) => {
      state.globalHelp.isOpen = false;
      state.globalHelp.module = null;
      state.globalHelp.section = null;
    },
  },
});

export const { 
  openFleetDrawer, 
  closeFleetDrawer, 
  openGlobalAnalytics, 
  closeGlobalAnalytics,
  openGlobalHelp,
  closeGlobalHelp
} = uiSlice.actions;
export default uiSlice.reducer;
