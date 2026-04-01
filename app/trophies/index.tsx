import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typo } from '../../components/ui/Typography';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../store/useStore';
import { TrophiesList } from '../../components/features/TrophiesList';
import { Lock, Unlock } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

export default function TrophiesScreen() {
    const { text, card, colorMode } = useTheme();
    const { achievements } = useStore(useShallow(state => ({
  achievements: state.achievements
})));

    return (
        <View style={[styles.container, { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.background }]}>
            <Stack.Screen options={{ title: 'Trophées', headerTintColor: text, headerStyle: { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.white } }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.header, { borderBottomColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                    <Typo variant="h2" weight="black" color={text}>Mes Succès</Typo>
                    <Typo variant="body" color={Colors.textSecondary}>
                        Débloquez des badges en participant à la vie de la communauté.
                    </Typo>
                </View>

                <TrophiesList variant="grid" horizontal={false} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    card: {
        width: '47%', // 2 columns with gap
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.success,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    }
});
