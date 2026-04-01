import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { StandingsTable } from '../../components/features/StandingsTable';
import { PlayersStandings } from '../../components/features/PlayersStandings';
import { Colors, CardStyles } from '../../constants/Colors';
import { MatchCard } from '../../components/features/MatchCard';
import { useStore } from '../../store/useStore';
import { useTeamTheme } from '../../hooks/useTeamTheme';
import { Calendar, Trophy, Users } from 'lucide-react-native';
import { MatchListSkeleton } from '../../components/features/MatchListSkeleton';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'calendar' | 'teams' | 'players';

const TABS: { id: TabType; label: string; icon: any }[] = [
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'teams', label: 'Équipes', icon: Trophy },
    { id: 'players', label: 'Joueurs', icon: Users },
];

/**
 * Écran Compétition (MatchesScreen) - Thème France.
 */
export default function MatchesScreen() {
    const [tab, setTab] = useState<TabType>('calendar');
    const { matches, fetchMatches, isLoading } = useStore();
    const { primary } = useTeamTheme();
    const { colorMode } = useTheme();

    const { width } = Dimensions.get('window');
    const tabWidth = (width - 48) / 3; // 48 = paddingHorizontal 24 * 2

    const indicatorX = useSharedValue(0);

    const animatedIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value * tabWidth }],
        width: tabWidth,
    }));

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleTabChange = (newTab: TabType, index: number) => {
        setTab(newTab);
        indicatorX.value = withTiming(index, { duration: 200 });
    };

    return (
        <LiquidContainer >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Typo variant="h1" weight="black" color={Colors.night}>COMPÉTITION</Typo>
                    <Typo variant="caption" color={Colors.textSecondary}>Ligue Magnus 2025-2026</Typo>
                </View>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <View style={[styles.tabWrapper, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate }]}>
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            { backgroundColor: primary, width: tabWidth - 8 }, // -8 for padding
                            animatedIndicatorStyle
                        ]}
                    />
                    {TABS.map((t, index) => {
                        const isActive = tab === t.id;
                        const Icon = t.icon;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={styles.tabBtn}
                                onPress={() => handleTabChange(t.id, index)}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    size={16}
                                    color={isActive ? Colors.white : (colorMode === 'dark' ? Colors.white : Colors.textSecondary)}
                                    style={{ opacity: isActive ? 1 : 0.6 }}
                                />
                                <Typo
                                    variant="caption"
                                    weight="bold"
                                    color={isActive ? Colors.white : (colorMode === 'dark' ? Colors.white : Colors.textSecondary)}
                                    style={{ opacity: isActive ? 1 : 0.6 }}
                                >
                                    {t.label}
                                </Typo>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
                {tab === 'calendar' ? (
                    isLoading ? (
                        <ScrollView contentContainerStyle={styles.content}>
                            <MatchListSkeleton />
                        </ScrollView>
                    ) : (
                        <FlashList
                            data={matches}
                            renderItem={({ item }) => (
                                <View style={{ marginBottom: 16 }}>
                                    <MatchCard match={item} />
                                </View>
                            )}
                            // @ts-ignore
                            estimatedItemSize={140}
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {tab === 'teams' && <StandingsTable />}
                        {tab === 'players' && <PlayersStandings />}
                    </ScrollView>
                )}
            </View>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    tabContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.slate,
        borderRadius: 16,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        // width set dynamically
        height: '100%',
        borderRadius: 12,
        top: 4,
        left: 4,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        zIndex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 140,
    },
    list: {
        gap: 16,
    }
});

