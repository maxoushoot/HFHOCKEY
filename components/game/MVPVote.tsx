import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { Star, Crown, Check } from 'lucide-react-native';
import { Bounceable } from '../ui/Bounceable';
import { useConfetti } from '../../app/_layout';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useStore } from '../../store/useStore';

interface MVPVoteProps {
    homeTeamId?: string;
    awayTeamId?: string;
    onVote?: (playerId: string) => void;
    initialVotedId?: string | null;
    readOnly?: boolean;
}

export function MVPVote({ homeTeamId, awayTeamId, onVote, initialVotedId, readOnly = false }: MVPVoteProps) {
    const { players, fetchPlayersForMatch } = useStore();
    const [votedId, setVotedId] = useState<string | null>(initialVotedId || null);
    const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');
    const scale = useSharedValue(1);
    const { explode } = useConfetti();

    // ...

    const handleVote = async (id: string) => {
        if (readOnly) return;
        const previousId = votedId;

        // Optimistic Visual Update
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        explode(); // CONFETTI HERE
        scale.value = withSequence(withSpring(0.98), withSpring(1));
        setVotedId(id);

        try {
            if (onVote) {
                // Must be an async propagation to bubble up the throw
                await Promise.resolve(onVote(id)); 
            }
        } catch (error) {
            console.warn('[MVPVote] Rollback UI due to server rejection');
            setVotedId(previousId);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const [activeFilter, setActiveFilter] = useState('TOUS');

    // Filter players by team and position
    const currentPlayers = players.filter(p =>
        activeTab === 'home' ? p.team_id === homeTeamId : p.team_id === awayTeamId
    );

    const filteredPlayers = currentPlayers.filter(p => {
        if (activeFilter === 'TOUS') return true;
        if (activeFilter === 'ATTAQUANTS') return ['C', 'LW', 'RW', 'F'].includes(p.position);
        if (activeFilter === 'DÉFENSEURS') return ['D', 'LD', 'RD'].includes(p.position);
        if (activeFilter === 'GARDIENS') return ['G'].includes(p.position);
        return true;
    });

    const getVotedPlayer = () => {
        return players.find(p => p.id === votedId);
    };

    // Render result mode (read-only summary) or just the selected player if readOnly is true
    if (readOnly && votedId) {
        const player = getVotedPlayer();
        if (!player) return null;

        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                <View style={styles.header}>
                    <Crown size={22} color={Colors.gold} fill={Colors.gold} />
                    <Typo variant="h3" weight="black" color={Colors.night}>
                        VOTRE MVP DU MATCH
                    </Typo>
                </View>
                <View style={styles.resultContainer}>
                    <View style={styles.selectedAvatarLarge}>
                        <Typo variant="h2" color={Colors.textSecondary}>#{player.jersey_number}</Typo>
                        <View style={styles.checkBadgeLarge}>
                            <Check size={16} color={Colors.white} />
                        </View>
                    </View>
                    <Typo variant="h3" weight="bold" color={Colors.night}>{player.name}</Typo>
                    <Typo variant="body" color={Colors.textSecondary}>{player.position} - {player.team_id === homeTeamId ? 'Domicile' : 'Extérieur'}</Typo>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.header}>
                <Crown size={22} color={Colors.gold} fill={Colors.gold} />
                <Typo variant="h3" weight="black" color={Colors.night}>
                    MVP DU MATCH
                </Typo>
            </View>

            <Typo variant="caption" color={Colors.textSecondary} style={styles.subtitle}>
                Votez pour le meilleur joueur du match
            </Typo>

            {/* Team Toggles - Only show if not voted yet or allowed to change */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'home' && styles.activeTab]}
                    onPress={() => setActiveTab('home')}
                >
                    <Typo variant="body" weight="bold" color={activeTab === 'home' ? Colors.white : Colors.textSecondary}>
                        DOMICILE
                    </Typo>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'away' && styles.activeTab]}
                    onPress={() => setActiveTab('away')}
                >
                    <Typo variant="body" weight="bold" color={activeTab === 'away' ? Colors.white : Colors.textSecondary}>
                        EXTÉRIEUR
                    </Typo>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    {['TOUS', 'ATTAQUANTS', 'DÉFENSEURS', 'GARDIENS'].map((filter) => (
                        <Bounceable
                            key={filter}
                            style={[
                                styles.filterBadge,
                                activeFilter === filter && styles.filterBadgeActive
                            ]}
                            onPress={() => setActiveFilter(filter)}
                            scale={0.95}
                        >
                            <Typo
                                variant="caption"
                                weight="bold"
                                color={activeFilter === filter ? Colors.white : Colors.textSecondary}
                            >
                                {filter}
                            </Typo>
                        </Bounceable>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.gridContainer}>
                {filteredPlayers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Typo variant="caption" color={Colors.textSecondary}>Aucun joueur trouvé</Typo>
                    </View>
                ) : (
                    filteredPlayers.map((player) => {
                        const isSelected = votedId === player.id;
                        const isDisabled = votedId !== null && !isSelected;

                        return (
                            <TouchableOpacity
                                key={player.id}
                                style={[
                                    styles.playerCard,
                                    isSelected && styles.selectedPlayerCard,
                                    isDisabled && styles.dimmedCard
                                ]}
                                onPress={() => handleVote(player.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.avatarContainer, isSelected && styles.selectedAvatar]}>
                                    <Typo variant="h3" color={Colors.textSecondary}>#{player.jersey_number}</Typo>
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <Check size={10} color={Colors.white} />
                                        </View>
                                    )}
                                </View>
                                <Typo variant="caption" weight="bold" color={Colors.night} numberOfLines={1}>
                                    {player.name.split(' ').pop()}
                                </Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>
                                    {player.position}
                                </Typo>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </Animated.View >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 4,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    resultContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: Colors.night,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
        paddingVertical: 10,
    },
    playerCard: {
        width: '20%', // approx 4 columns
        minWidth: 70,
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    selectedPlayerCard: {
        transform: [{ scale: 1.05 }],
    },
    dimmedCard: {
        opacity: 0.5,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    selectedAvatar: {
        borderColor: Colors.gold,
        backgroundColor: 'rgba(202, 138, 4, 0.1)',
    },
    selectedAvatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(202, 138, 4, 0.1)',
        borderWidth: 3,
        borderColor: Colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.gold,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    checkBadgeLarge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.gold,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    emptyState: {
        flex: 1,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    footer: {
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#F0FDF4',
        padding: 8,
        borderRadius: 8,
    },
    filtersScroll: {
        marginBottom: 16,
    },
    filtersContainer: {
        gap: 8,
        paddingHorizontal: 4,
    },
    filterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterBadgeActive: {
        backgroundColor: Colors.night,
        borderColor: Colors.night,
    }
});
