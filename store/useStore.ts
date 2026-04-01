import { create } from 'zustand';
import { StoreState } from './types';
import { createAuthSlice } from './slices/createAuthSlice';
import { createDataSlice } from './slices/createDataSlice';
import { createUISlice } from './slices/createUISlice';

/**
 * Store Global de l'Application
 * 
 * Utilise le pattern "Slices" de Zustand pour découper l'état en modules logiques.
 * - Auth: Authentification, Profil, Social
 * - Data: Matchs, Équipes, Événements
 * - UI: État de chargement, Modales
 */
export const useStore = create<StoreState>()((...a) => ({
    ...createAuthSlice(...a),
    ...createDataSlice(...a),
    ...createUISlice(...a),
}));
