import { StateCreator } from 'zustand';
import { StoreState, UISlice } from '../types';

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
});
