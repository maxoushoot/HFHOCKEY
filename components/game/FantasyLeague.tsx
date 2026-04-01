import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { TactileButton } from '../ui/TactileButton';
import {
    Target, Users, Trophy, Star, Check, X,
    ChevronRight, Coins, Shield, Zap, Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

interface FantasyLeagueProps {
    onScore?: (score: number) => void;
}

interface Player {
    id: string;
    name: string;
    team_id: string;
    jersey_number: number;
    position: 'G' | 'D' | 'F';
    goals: number;
    assists: number;
    matches_played: number;
    team?: {
        name: string;
        logo_url: string;
        color: string;
    };
}

interface FantasyPlayer extends Player {
    price: number;
    points: number;
}

// Calculate player price based on performance
const calculatePrice = (player: Player): number => {
    const basePrice = player.position === 'G' ? 15 : player.position === 'D' ? 12 : 10;
    const performanceBonus = (player.goals * 2) + player.assists;
    return Math.min(30, Math.max(8, basePrice + Math.floor(performanceBonus / 2)));
};

// Calculate fantasy points
const calculatePoints = (player: Player): number => {
    return (player.goals * 5) + (player.assists * 3) + player.matches_played;
};

const POSITION_LABELS = {
    G: 'Gardien',
    D: 'Défenseur',
    F: 'Attaquant'
};

const POSITION_COLORS = {
    G: '#F59E0B',
    D: '#3B82F6',
    F: '#10B981'
};

const ROSTER_REQUIREMENTS = {
    G: 1,
    D: 2,
    F: 2
};

import { useTheme } from '../../context/ThemeContext';

// ... (keep interfaces and helper functions)

const INITIAL_BUDGET = 100;

import { FantasyLeaderboard } from './FantasyLeaderboard';
import { useShallow } from 'zustand/react/shallow';

// ... (keep existing imports)

export function FantasyLeague({ onScore }: FantasyLeagueProps) {
    const { teams, updateXP } = useStore(useShallow(state => ({
  teams: state.teams,
  updateXP: state.updateXP
})));
    const { text, card, background, subText, colorMode } = useTheme();
    const [activeTab, setActiveTab] = useState<'team' | 'leaderboard'>('team');
    const [gameState, setGameState] = useState<'roster' | 'captain' | 'validating' | 'locked' | 'result'>('roster');
    const [players, setPlayers] = useState<FantasyPlayer[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<FantasyPlayer[]>([]);
    const [captainId, setCaptainId] = useState<string | null>(null);
    const [budget, setBudget] = useState(INITIAL_BUDGET);
    const [filterPosition, setFilterPosition] = useState<'all' | 'G' | 'D' | 'F'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // ... (keep useEffect for fetching players)

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch all players
                const { data: playersData, error: playersError } = await supabase
                    .from('players')
                    .select(`*, team:team_id (name, logo_url, color)`)
                    .order('goals', { ascending: false })
                    .limit(50);
                
                if (playersError) throw playersError;

                const allPlayers = (playersData || []).map(p => ({
                    ...p,
                    price: calculatePrice(p as unknown as Player),
                    points: calculatePoints(p as unknown as Player)
                })) as FantasyPlayer[];
                setPlayers(allPlayers);

                // 2. Fetch my team
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: team, error: teamError } = await supabase
                        .from('fantasy_teams')
                        .select('*, fantasy_team_players(player_id)')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (teamError) throw teamError;

                    if (team) {
                        setGameState('locked'); // Default to locked if team exists
                        setCaptainId(team.captain_id);
                        setBudget(team.budget_remaining);

                        if (team.fantasy_team_players) {
                            const playerIds = team.fantasy_team_players.map((ftp: { player_id: string }) => ftp.player_id);
                            const teamPlayers = allPlayers.filter(p => playerIds.includes(p.id));
                            setSelectedPlayers(teamPlayers);
                        }
                    }
                }
            } catch (err) {
                console.error('[FantasyLeague] init error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const filteredPlayers = useMemo(() => {
        if (filterPosition === 'all') return players;
        return players.filter(p => p.position === filterPosition);
    }, [players, filterPosition]);

    const rosterCount = useMemo(() => ({
        G: selectedPlayers.filter(p => p.position === 'G').length,
        D: selectedPlayers.filter(p => p.position === 'D').length,
        F: selectedPlayers.filter(p => p.position === 'F').length,
    }), [selectedPlayers]);

    const isRosterComplete =
        rosterCount.G === ROSTER_REQUIREMENTS.G &&
        rosterCount.D === ROSTER_REQUIREMENTS.D &&
        rosterCount.F === ROSTER_REQUIREMENTS.F;

    const totalPoints = useMemo(() =>
        selectedPlayers.reduce((sum, p) => {
            const points = p.points;
            return sum + (p.id === captainId ? points * 2 : points);
        }, 0),
        [selectedPlayers, captainId]
    );

    const canSelectPlayer = (player: FantasyPlayer): boolean => {
        if (selectedPlayers.find(p => p.id === player.id)) return false;
        if (budget < player.price) return false;
        if (rosterCount[player.position] >= ROSTER_REQUIREMENTS[player.position]) return false;
        return true;
    };

    const selectPlayer = (player: FantasyPlayer) => {
        if (!canSelectPlayer(player)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedPlayers(prev => [...prev, player]);
        setBudget(prev => prev - player.price);
    };

    const removePlayer = (player: FantasyPlayer) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
        setBudget(prev => prev + player.price);
        if (captainId === player.id) setCaptainId(null);
    };

    const proceedToCaptain = () => {
        if (!isRosterComplete) return;
        setGameState('captain');
    };

    const selectCaptain = (id: string) => {
        setCaptainId(id);
        Haptics.selectionAsync();
    };

    const confirmTeam = async () => {
        if (!captainId) return;
        setGameState('validating');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non connecté");

            // 1. Create/Update Team
            const { data: team, error: teamError } = await supabase
                .from('fantasy_teams')
                .upsert({
                    user_id: user.id,
                    captain_id: captainId,
                    total_points: totalPoints, // Saving potential points
                    budget_remaining: budget,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (teamError) throw teamError;

            // 2. Link Players
            await supabase.from('fantasy_team_players').delete().eq('fantasy_team_id', team.id);

            const playerLinks = selectedPlayers.map(p => ({
                fantasy_team_id: team.id,
                player_id: p.id
            }));

            const { error: linkError } = await supabase.from('fantasy_team_players').insert(playerLinks);
            if (linkError) throw linkError;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Go to Locked state instead of Result directly
            setGameState('locked');

        } catch (error: unknown) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error(error);
            const msg = error instanceof Error ? error.message : "Erreur inconnue";
            alert("Erreur lors de la sauvegarde: " + msg);
            setGameState('captain');
        }
    };

    const resetTeam = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('fantasy_teams').delete().eq('user_id', user.id);
        }

        setSelectedPlayers([]);
        setCaptainId(null);
        setBudget(INITIAL_BUDGET);
        setGameState('roster');
    };

    // ============ LOCKED SCREEN ============
    if (gameState === 'locked') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1e1e2e', '#111116']}
                    style={StyleSheet.absoluteFillObject}
                />
                <ScrollView contentContainerStyle={styles.resultContent}>
                    <View style={[styles.lockedHeader, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <Shield size={48} color={Colors.france.blue} />
                        <Typo variant="h2" weight="black" color={Colors.white} style={{ textAlign: 'center', marginTop: 16 }}>
                            Équipe Verrouillée
                        </Typo>
                        <Typo variant="body" color={subText} style={{ textAlign: 'center', marginTop: 8 }}>
                            Votre équipe est validée pour les matchs de ce soir. Les changements ne sont plus possibles.
                        </Typo>
                    </View>

                    <View style={styles.teamPreview}>
                        <Typo variant="caption" weight="black" color={subText} style={{ marginBottom: 12 }}>
                            VOTRE 5 DE DÉPART
                        </Typo>
                        {selectedPlayers.map(player => (
                            <View key={player.id} style={styles.previewRow}>
                                <View style={[styles.positionBadgeSmall, { backgroundColor: POSITION_COLORS[player.position] }]}>
                                    <Typo variant="caption" weight="bold" color={Colors.white}>{player.position}</Typo>
                                </View>
                                <Typo variant="body" weight="bold" color={Colors.white} style={{ flex: 1 }}>{player.name}</Typo>
                                {player.id === captainId && (
                                    <View style={styles.captainBadgeSmall}>
                                        <Typo variant="caption" weight="black" color={Colors.night}>C</Typo>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Typo variant="caption" weight="bold" color={Colors.white} style={{ letterSpacing: 1 }}>
                            EN ATTENTE DES RÉSULTATS
                        </Typo>
                    </View>

                    <TactileButton
                        style={[styles.resetBtn, { backgroundColor: Colors.france.blue, marginTop: 40 }]}
                        onPress={() => {
                            updateXP(50); // Reward for checking results
                            setGameState('result');
                        }}
                    >
                        <Typo variant="body" weight="bold" color={Colors.white}>
                            Voir les Résultats (Simulé)
                        </Typo>
                    </TactileButton>

                    <TouchableOpacity onPress={resetTeam} style={{ marginTop: 20, alignSelf: 'center' }}>
                        <Typo variant="caption" color={Colors.france.red}>Annuler / Reset (Dev)</Typo>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // ============ RESULT SCREEN ============
    if (gameState === 'result') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={StyleSheet.absoluteFillObject}
                />
                <ScrollView contentContainerStyle={styles.resultContent}>
                    <Trophy size={48} color={Colors.gold} />
                    <Typo variant="h2" weight="black" color={Colors.white}>
                        Résultats de la soirée !
                    </Typo>

                    <View style={[styles.scoreCard, { backgroundColor: card }]}>
                        <Typo variant="h1" weight="black" color={text}>
                            {totalPoints}
                        </Typo>
                        <Typo variant="caption" color={subText}>
                            POINTS FANTASY
                        </Typo>
                    </View>

                    <View style={styles.teamList}>
                        {selectedPlayers.map(player => (
                            <View key={player.id} style={styles.resultPlayerRow}>
                                <View style={[styles.positionBadgeSmall, { backgroundColor: POSITION_COLORS[player.position] }]}>
                                    <Typo variant="caption" weight="bold" color={Colors.white}>
                                        {player.position}
                                    </Typo>
                                </View>
                                <View style={styles.resultPlayerInfo}>
                                    <Typo variant="body" weight="bold" color={Colors.white}>
                                        {player.name}
                                    </Typo>
                                    <Typo variant="caption" color="rgba(255,255,255,0.7)">
                                        {player.team?.name}
                                    </Typo>
                                </View>
                                <View style={styles.resultPoints}>
                                    <Typo variant="body" weight="black" color={Colors.gold}>
                                        +{player.points}
                                    </Typo>
                                </View>
                            </View>
                        ))}
                    </View>

                    <TactileButton style={[styles.resetBtn, { backgroundColor: card }]} onPress={resetTeam}>
                        <Typo variant="body" weight="bold" color={text}>
                            Nouvelle Équipe
                        </Typo>
                    </TactileButton>
                </ScrollView>
            </View>
        );
    }

    // ============ VALIDATING SCREEN ============
    if (gameState === 'validating') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient
                    colors={[background, colorMode === 'dark' ? '#1e1e2e' : Colors.snowSecondary]}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.validatingContent}>
                    <Shield size={64} color={Colors.france.blue} />
                    <Typo variant="h2" weight="black" color={text} style={{ marginTop: 24 }}>
                        Validation de l'équipe...
                    </Typo>
                    <Typo variant="body" color={subText} style={{ marginTop: 8 }}>
                        Vérification du plafond salarial
                    </Typo>
                </View>
            </View>
        );
    }

    // ============ CAPTAIN SELECTION SCREEN ============
    if (gameState === 'captain') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[background, colorMode === 'dark' ? '#1a1a2e' : Colors.snowSecondary]}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Award size={20} color={Colors.gold} />
                        <Typo variant="body" weight="bold" color={text}>
                            Choisir le Capitaine (x2 Pts)
                        </Typo>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                    {selectedPlayers.map(player => (
                        <TouchableOpacity
                            key={player.id}
                            style={[
                                styles.playerCard,
                                { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate, borderWidth: 1 },
                                captainId === player.id && styles.playerCardSelected
                            ]}
                            onPress={() => selectCaptain(player.id)}
                        >
                            <View style={[styles.positionBadge, { backgroundColor: POSITION_COLORS[player.position] }]}>
                                <Typo variant="caption" weight="bold" color={Colors.white}>
                                    {player.position}
                                </Typo>
                            </View>

                            <View style={styles.playerInfo}>
                                <Typo variant="body" weight="bold" color={text}>
                                    {player.name}
                                </Typo>
                                <Typo variant="caption" color={subText}>
                                    {player.team?.name}
                                </Typo>
                            </View>

                            {captainId === player.id && (
                                <View style={styles.captainBadge}>
                                    <Typo variant="caption" weight="black" color={Colors.night}>C</Typo>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[styles.confirmBar, { backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', borderTopColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                    <View />
                    <TactileButton
                        style={[styles.confirmBtn, !captainId && { opacity: 0.5 }]}
                        onPress={confirmTeam}
                        disabled={!captainId}
                    >
                        <Typo variant="body" weight="bold" color={Colors.white}>
                            Valider
                        </Typo>
                        <Check size={18} color={Colors.white} />
                    </TactileButton>
                </View>
            </View>
        );
    }

    // ============ ROSTER BUILDER SCREEN ============
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[background, colorMode === 'dark' ? '#1a1a2e' : Colors.snowSecondary]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header with Segments */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Target size={20} color={text} />
                    <Typo variant="body" weight="bold" color={text}>
                        Fantasy
                    </Typo>
                </View>

                <View style={styles.segmentControl}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, activeTab === 'team' && styles.segmentBtnActive]}
                        onPress={() => setActiveTab('team')}
                    >
                        <Typo
                            variant="caption"
                            weight="bold"
                            color={activeTab === 'team' ? Colors.white : subText}
                        >
                            Mon Équipe
                        </Typo>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentBtn, activeTab === 'leaderboard' && styles.segmentBtnActive]}
                        onPress={() => setActiveTab('leaderboard')}
                    >
                        <Typo
                            variant="caption"
                            weight="bold"
                            color={activeTab === 'leaderboard' ? Colors.white : subText}
                        >
                            Classement
                        </Typo>
                    </TouchableOpacity>
                </View>

                {activeTab === 'team' && (
                    <View style={styles.budgetBadge}>
                        <Coins size={14} color={Colors.gold} />
                        <Typo variant="body" weight="black" color={Colors.gold}>
                            {budget}
                        </Typo>
                    </View>
                )}
            </View>

            {activeTab === 'leaderboard' ? (
                <FantasyLeaderboard />
            ) : (
                <>
                    {/* Roster Status */}
                    <View style={[styles.rosterStatus, { borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        {(['G', 'D', 'F'] as const).map(pos => (
                            <View key={pos} style={styles.rosterSlot}>
                                <View style={[
                                    styles.rosterIcon,
                                    { backgroundColor: POSITION_COLORS[pos] },
                                    rosterCount[pos] >= ROSTER_REQUIREMENTS[pos] && styles.rosterIconComplete
                                ]}>
                                    {rosterCount[pos] >= ROSTER_REQUIREMENTS[pos] ? (
                                        <Check size={14} color={Colors.white} />
                                    ) : (
                                        <Typo variant="caption" weight="bold" color={Colors.white}>
                                            {pos}
                                        </Typo>
                                    )}
                                </View>
                                <Typo variant="caption" color={subText}>
                                    {rosterCount[pos]}/{ROSTER_REQUIREMENTS[pos]}
                                </Typo>
                            </View>
                        ))}
                    </View>

                    {/* Selected Players */}
                    {selectedPlayers.length > 0 && (
                        <View style={styles.selectedSection}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {selectedPlayers.map(player => (
                                    <TouchableOpacity
                                        key={player.id}
                                        style={[styles.selectedPlayerChip, { backgroundColor: card }]}
                                        onPress={() => removePlayer(player)}
                                    >
                                        <View style={[styles.chipPosition, { backgroundColor: POSITION_COLORS[player.position] }]}>
                                            <Typo variant="caption" weight="bold" color={Colors.white}>
                                                {player.position}
                                            </Typo>
                                        </View>
                                        <Typo variant="caption" weight="bold" color={text} numberOfLines={1}>
                                            {player.name.split(' ').pop()}
                                        </Typo>
                                        <X size={14} color={subText} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Position Filter */}
                    <View style={styles.filterRow}>
                        {(['all', 'G', 'D', 'F'] as const).map(pos => (
                            <TouchableOpacity
                                key={pos}
                                style={[
                                    styles.filterBtn,
                                    { backgroundColor: filterPosition === pos ? Colors.france.blue : (colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') }
                                ]}
                                onPress={() => setFilterPosition(pos)}
                            >
                                <Typo
                                    variant="caption"
                                    weight="bold"
                                    color={filterPosition === pos ? Colors.white : subText}
                                >
                                    {pos === 'all' ? 'Tous' : POSITION_LABELS[pos]}
                                </Typo>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Player List */}
                    <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <Typo variant="body" color={subText}>
                                    Chargement des joueurs...
                                </Typo>
                            </View>
                        ) : (
                            filteredPlayers.map(player => {
                                const isSelected = selectedPlayers.find(p => p.id === player.id);
                                const canSelect = canSelectPlayer(player);

                                return (
                                    <TouchableOpacity
                                        key={player.id}
                                        style={[
                                            styles.playerCard,
                                            { backgroundColor: card },
                                            isSelected && styles.playerCardSelected,
                                            !canSelect && !isSelected && styles.playerCardDisabled
                                        ]}
                                        onPress={() => isSelected ? removePlayer(player) : selectPlayer(player)}
                                        disabled={!canSelect && !isSelected}
                                    >
                                        <View style={[styles.positionBadge, { backgroundColor: POSITION_COLORS[player.position] }]}>
                                            <Typo variant="caption" weight="bold" color={Colors.white}>
                                                {player.position}
                                            </Typo>
                                        </View>

                                        <View style={styles.playerInfo}>
                                            <Typo variant="body" weight="bold" color={text} numberOfLines={1}>
                                                {player.name}
                                            </Typo>
                                            <View style={styles.playerStats}>
                                                <Typo variant="caption" color={subText}>
                                                    {player.team?.name} • #{player.jersey_number}
                                                </Typo>
                                                <View style={styles.statRow}>
                                                    <Typo variant="caption" color="#10B981">
                                                        {player.goals}B
                                                    </Typo>
                                                    <Typo variant="caption" color="#3B82F6">
                                                        {player.assists}A
                                                    </Typo>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.playerRight}>
                                            <View style={styles.priceBadge}>
                                                <Coins size={12} color={Colors.gold} />
                                                <Typo variant="caption" weight="bold" color={Colors.gold}>
                                                    {player.price}
                                                </Typo>
                                            </View>
                                            <View style={styles.pointsBadge}>
                                                <Typo variant="caption" weight="bold" color="#10B981">
                                                    {player.points} pts
                                                </Typo>
                                            </View>
                                        </View>

                                        {isSelected && (
                                            <View style={styles.selectedOverlay}>
                                                <Check size={20} color={Colors.white} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Confirm Button */}
                    {isRosterComplete && (
                        <View style={[styles.confirmBar, { backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', borderTopColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                            <View>
                                <Typo variant="caption" color={subText}>
                                    Budget restant
                                </Typo>
                                <Typo variant="h3" weight="black" color={Colors.gold}>
                                    {budget}
                                </Typo>
                            </View>
                            <TactileButton style={styles.confirmBtn} onPress={proceedToCaptain}>
                                <Typo variant="body" weight="bold" color={Colors.white}>
                                    Suivant
                                </Typo>
                                <ChevronRight size={18} color={Colors.white} />
                            </TactileButton>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,200,0,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },

    // Roster Status
    rosterStatus: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    rosterSlot: {
        alignItems: 'center',
        gap: 4,
    },
    rosterIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rosterIconComplete: {
        backgroundColor: '#10B981',
    },

    // Selected Players
    selectedSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectedPlayerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    chipPosition: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Filter
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    filterBtnActive: {
        backgroundColor: Colors.france.blue,
    },

    // Player List
    playerList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingBox: {
        padding: 40,
        alignItems: 'center',
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        gap: 12,
    },
    playerCardSelected: {
        backgroundColor: 'rgba(16,185,129,0.2)',
        borderWidth: 1,
        borderColor: '#10B981',
    },
    playerCardDisabled: {
        opacity: 0.4,
    },
    positionBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    positionBadgeSmall: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerInfo: {
        flex: 1,
    },
    playerStats: {
        marginTop: 2,
    },
    statRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 2,
    },
    playerRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pointsBadge: {
        backgroundColor: 'rgba(16,185,129,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    selectedOverlay: {
        position: 'absolute',
        right: 12,
        backgroundColor: '#10B981',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Confirm Bar
    confirmBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },

    // Result Screen
    resultContent: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    scoreCard: {
        backgroundColor: Colors.white,
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 20,
    },
    teamList: {
        width: '100%',
        gap: 8,
        marginTop: 16,
    },
    resultPlayerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    resultPlayerInfo: {
        flex: 1,
    },
    resultPoints: {
        backgroundColor: 'rgba(255,200,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    resetBtn: {
        backgroundColor: Colors.white,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 24,
    },
    captainBadge: {
        backgroundColor: Colors.gold,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    validatingContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Locked Screen Styles
    lockedHeader: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    teamPreview: {
        width: '100%',
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    captainBadgeSmall: {
        backgroundColor: Colors.gold,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.france.red,
    },
    // Segment Control
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    segmentBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    segmentBtnActive: {
        backgroundColor: Colors.france.blue,
    },
});
