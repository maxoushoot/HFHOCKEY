import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { ConfettiSystem, ConfettiRef } from '../components/ui/ConfettiSystem';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export const ConfettiContext = createContext<{ explode: () => void }>({ explode: () => { } });
export const useConfetti = () => useContext(ConfettiContext);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Layout Racine (RootLayout).
 * 
 * C'est le point d'entrée principal de l'interface utilisateur.
 * Son rôle est d'initialiser tout ce qui est global à l'application :
 * 1. Polices d'écriture (Google Fonts Inter).
 * 2. Thème (Mode Sombre/Clair, mais on force souvent le mode personnalisé).
 * 3. Écran de démarrage (Splash Screen) pour cacher le chargement.
 * 4. La navigation principale (Stack).
 */
export default function RootLayout() {
    const confettiRef = useRef<ConfettiRef>(null);

    const explode = () => {
        confettiRef.current?.explode();
    };

    // Chargement des polices (Asynchrone)
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
    });

    // Gestion des erreurs de chargement de police
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    // Une fois les polices chargées, on cache l'écran de démarrage
    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    // Auth Persistence
    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log("Session restaurée:", session.user.email);
                useStore.getState().setSession(session);
                useStore.getState().fetchProfile(session.user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            useStore.getState().setSession(session);
            if (session) {
                useStore.getState().fetchProfile(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Tant que ce n'est pas chargé, on n'affiche rien (le Splash Screen natif est toujours là)
    if (!loaded) {
        return null;
    }

    return (
        // ThemeProvider : Rend le thème accessible partout via useTheme()
        <ErrorBoundary>
            <ConfettiContext.Provider value={{ explode }}>
                <ThemeProvider>
                    <NotificationProvider>
                        <View style={{ flex: 1 }}>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                            </Stack>
                            <StatusBar style="dark" />
                            <ConfettiSystem ref={confettiRef} />
                        </View>
                    </NotificationProvider>
                </ThemeProvider>
            </ConfettiContext.Provider>
        </ErrorBoundary>
    );
}

