import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { View, ActivityIndicator } from 'react-native';

export default function AdminLayout() {
    const { profile, session, isLoading } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!session || profile?.role !== 'admin')) {
            // Redirect to home if not admin
            // router.replace('/(tabs)/home');
        }
    }, [isLoading, session, profile]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="teams/index" options={{ headerShown: true, title: 'Équipes' }} />
            <Stack.Screen name="players/index" options={{ headerShown: true, title: 'Joueurs' }} />
            <Stack.Screen name="matches/index" options={{ headerShown: true, title: 'Matchs' }} />
            <Stack.Screen name="users/index" options={{ headerShown: true, title: 'Utilisateurs' }} />
            <Stack.Screen name="news/index" options={{ headerShown: true, title: 'Actualités' }} />
            <Stack.Screen name="trophies/index" options={{ headerShown: true, title: 'Trophées' }} />
            <Stack.Screen name="academy/index" options={{ headerShown: true, title: 'Académie' }} />
            <Stack.Screen name="quizzes/index" options={{ headerShown: true, title: 'Quiz' }} />
            <Stack.Screen name="notifications/index" options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="sync" options={{ headerShown: true, title: 'Synchronisation API' }} />
        </Stack>
    );
}
