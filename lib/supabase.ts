import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * Adaptateur de Stockage Sécurisé.
 * 
 * Supabase a besoin de savoir OÙ stocker les tokens (JWT) de l'utilisateur connecté.
 * Par défaut, React Native utilise l'AsyncStorage (non chiffré).
 * 
 * Ici, nous créons un petit adaptateur qui force Supabase à utiliser `expo-secure-store`.
 * C'est comme un coffre-fort chiffré sur le téléphone. C'est essentiel pour la sécurité.
 */
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};

// On récupère les clés API depuis les variables d'environnement (.env) pour ne pas les exposer dans le code.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Client Supabase (Singleton).
 * C'est l'unique instance qui sera utilisée par toute l'application pour parler à la base de données.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter, // Utilisation de notre adaptateur sécurisé
        autoRefreshToken: true,          // Rafraîchit le token automatiquement quand il expire
        persistSession: true,            // Garde l'utilisateur connecté même après redémarrage
        detectSessionInUrl: false,       // Inutile sur mobile (c'est pour le web)
    },
});
