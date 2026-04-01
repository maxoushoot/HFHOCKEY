
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Trophy, Calendar, Users, BarChart3, ChevronRight, Lock, MapPin, Target, Award, Shield } from 'lucide-react-native';
import { MatchCard } from '../../components/features/MatchCard';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionModal } from '../../components/features/SubscriptionModal';
import { Bounceable } from '../../components/ui/Bounceable';

const { width } = Dimensions.get('window');

function RosterSection({ title, players, color, cardColor, textColor, subTextColor, borderColor }: any) {
    if (players.length === 0) return null;

    return (
        <View style={{ marginBottom: 20 }}>
            <Typo variant="caption" weight="black" color={subTextColor} style={{ marginBottom: 10, letterSpacing: 1 }}>
                {title.toUpperCase()}
            </Typo>
            <View style={styles.rosterGrid}>
                {players.map((player: any) => (
                    <TouchableOpacity
                        key={player.id}
                        style={[styles.playerCard, { backgroundColor: cardColor, borderColor: borderColor }]}
                        activeOpacity={0.7}
                        onPress={() => Alert.alert(
                            player.name,
                            `Poste: ${player.position}\nButs: ${player.goals || 0}\nAssists: ${player.assists || 0}\nMatchs: ${player.matches_played || 0}`
                        )}
                    >
                        <View style={styles.playerAvatarContainer}>
                            {player.photo_url ? (
                                <Image source={{ uri: player.photo_url }} style={styles.playerPhoto} />
                            ) : (
                                <View style={[styles.playerAvatarPlaceholder, { backgroundColor: color + '10' }]}>
                                    <Users size={20} color={color} />
                                </View>
                            )}
                            <View style={[styles.statusDot, { backgroundColor: player.status === 'injured' ? Colors.france.red : '#4CD964' }]} />
                            <View style={[styles.numberBadge, { backgroundColor: color }]}>
                                <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 10 }}>
                                    {player.jersey_number || '??'}
                                </Typo>
                            </View>
                        </View>
                        <Typo weight="bold" color={textColor} style={{ fontSize: 13, textAlign: 'center' }}>
                            {player.name}
                        </Typo>
                        <Typo variant="caption" color={subTextColor} style={{ fontSize: 10 }}>
                            {player.goals || 0}G • {player.assists || 0}A • {(player.goals || 0) + (player.assists || 0)}PTS
                        </Typo>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

import { useTheme } from '../../context/ThemeContext';

export default function TeamDetailScreen() {
    const router = useRouter();
    const { id: slug } = useLocalSearchParams();
    const { teams, matches, players, fetchMatches, fetchTeams, fetchPlayers, profile } = useStore();
    const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
    const { text, card, background, subText, colorMode } = useTheme();

    useEffect(() => {
        fetchMatches();
        fetchTeams();
        fetchPlayers();
    }, []);

    const team = teams.find(t => t.slug === slug) || teams.find(t => t.id === slug) || null;

    if (!team) {
        return (
            <LiquidContainer>
                <View style={[styles.centered, { backgroundColor: background }]}>
                    <Typo color={text}>Équipe introuvable</Typo>
                    <TouchableOpacity onPress={() => router.back()}><Typo color={Colors.france.blue}>Retour</Typo></TouchableOpacity>
                </View>
            </LiquidContainer>
        );
    }

    const teamPlayers = useMemo(() => players.filter(p => p.team_id === team.id), [players, team.id]);
    const teamMatches = useMemo(() => matches.filter((m: any) =>
        m.home_team_id === team.id || m.away_team_id === team.id ||
        m.home_team?.slug === team.slug || m.away_team?.slug === team.slug
    ), [matches, team.id, team.slug]);

    const pastMatches = useMemo(() => teamMatches.filter((m: any) => m.status === 'finished').reverse(), [teamMatches]);
    const futureMatches = useMemo(() => teamMatches.filter((m: any) => m.status === 'scheduled' || m.status === 'live'), [teamMatches]);
    const lastMatch = pastMatches[0];

    // ─── Leaders: Top Scorer, Top Pointer, Top Goalie ───
    const leaders = useMemo(() => {
        const skaters = teamPlayers.filter(p => p.position !== 'G');
        const goalies = teamPlayers.filter(p => p.position === 'G');

        const topScorer = [...skaters].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0] || null;
        const topPointer = [...skaters].sort((a, b) => ((b.goals || 0) + (b.assists || 0)) - ((a.goals || 0) + (a.assists || 0)))[0] || null;
        const topGoalie = [...goalies].sort((a, b) => (b.matches_played || 0) - (a.matches_played || 0))[0] || null;

        return { topScorer, topPointer, topGoalie };
    }, [teamPlayers]);

    return (
        <LiquidContainer style={{ backgroundColor: background }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: card }]}>
                    <ArrowLeft color={text} size={24} />
                </TouchableOpacity>
                <Typo variant="h3" weight="black" color={text}>DÉTAILS ÉQUIPE</Typo>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Team Hero */}
                <View style={styles.teamHero}>
                    <LinearGradient
                        colors={[team.color || Colors.primary, Colors.night]}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <View style={[styles.logoContainer, { backgroundColor: card }]}>
                        {team.logo_url ? (
                            <Image source={{ uri: team.logo_url }} style={styles.logo} />
                        ) : (
                            <Typo variant="h1" weight="black" color={team.color}>{team.name?.charAt(0)}</Typo>
                        )}
                    </View>
                    <Typo variant="h2" weight="black" color={Colors.white} style={{ textAlign: 'center', marginTop: 12 }}>
                        {team.name?.toUpperCase()}
                    </Typo>
                    <Typo variant="body" color="rgba(255,255,255,0.7)">Ligue Magnus</Typo>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                        <Trophy size={20} color={Colors.gold} />
                        <Typo variant="h3" weight="black" color={text}>3ème</Typo>
                        <Typo variant="caption" color={subText}>Classement</Typo>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                        <BarChart3 size={20} color={Colors.france.blue} />
                        <Typo variant="h3" weight="black" color={text}>42</Typo>
                        <Typo variant="caption" color={subText}>Points</Typo>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                            <View style={[styles.formDot, { backgroundColor: '#4CD964' }]} />
                            <View style={[styles.formDot, { backgroundColor: '#4CD964' }]} />
                            <View style={[styles.formDot, { backgroundColor: Colors.france.red }]} />
                            <View style={[styles.formDot, { backgroundColor: '#4CD964' }]} />
                            <View style={[styles.formDot, { backgroundColor: '#4CD964' }]} />
                        </View>
                        <Typo variant="h3" weight="black" color={text}>V V D V V</Typo>
                        <Typo variant="caption" color={subText}>Forme</Typo>
                    </View>
                </View>

                {/* ─── Leaders Section ─── */}
                {teamPlayers.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typo variant="h3" weight="black" color={text}>Leaders</Typo>
                        </View>
                        <View style={styles.leadersRow}>
                            {leaders.topScorer && (
                                <View style={[styles.leaderCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                    <LinearGradient colors={['#F59E0B20', '#F59E0B05']} style={styles.leaderGlow} />
                                    <View style={[styles.leaderIconBg, { backgroundColor: '#FEF3C7' }]}>
                                        <Trophy size={18} color="#F59E0B" />
                                    </View>
                                    <Typo variant="caption" weight="bold" color={subText} style={{ fontSize: 9, letterSpacing: 1 }}>TOP BUTEUR</Typo>
                                    <Typo weight="black" color={text} style={{ fontSize: 13, textAlign: 'center' }} numberOfLines={1}>{leaders.topScorer.name}</Typo>
                                    <View style={[styles.leaderStatBadge, { backgroundColor: '#F59E0B' }]}>
                                        <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 12 }}>{leaders.topScorer.goals} G</Typo>
                                    </View>
                                </View>
                            )}
                            {leaders.topPointer && (
                                <View style={[styles.leaderCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                    <LinearGradient colors={['#3B82F620', '#3B82F605']} style={styles.leaderGlow} />
                                    <View style={[styles.leaderIconBg, { backgroundColor: '#DBEAFE' }]}>
                                        <Target size={18} color="#3B82F6" />
                                    </View>
                                    <Typo variant="caption" weight="bold" color={subText} style={{ fontSize: 9, letterSpacing: 1 }}>TOP POINTEUR</Typo>
                                    <Typo weight="black" color={text} style={{ fontSize: 13, textAlign: 'center' }} numberOfLines={1}>{leaders.topPointer.name}</Typo>
                                    <View style={[styles.leaderStatBadge, { backgroundColor: '#3B82F6' }]}>
                                        <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 12 }}>{(leaders.topPointer.goals || 0) + (leaders.topPointer.assists || 0)} PTS</Typo>
                                    </View>
                                </View>
                            )}
                            {leaders.topGoalie && (
                                <View style={[styles.leaderCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                    <LinearGradient colors={['#10B98120', '#10B98105']} style={styles.leaderGlow} />
                                    <View style={[styles.leaderIconBg, { backgroundColor: '#D1FAE5' }]}>
                                        <Shield size={18} color="#10B981" />
                                    </View>
                                    <Typo variant="caption" weight="bold" color={subText} style={{ fontSize: 9, letterSpacing: 1 }}>TOP GARDIEN</Typo>
                                    <Typo weight="black" color={text} style={{ fontSize: 13, textAlign: 'center' }} numberOfLines={1}>{leaders.topGoalie.name}</Typo>
                                    <View style={[styles.leaderStatBadge, { backgroundColor: '#10B981' }]}>
                                        <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 12 }}>{leaders.topGoalie.matches_played} MJ</Typo>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Advanced Stats (Premium) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Typo variant="h3" weight="black" color={text}>Stats Avancées</Typo>
                            {!profile?.is_premium && <Lock size={16} color={subText} />}
                        </View>
                    </View>

                    {profile?.is_premium ? (
                        <View style={styles.advancedStatsGrid}>
                            <View style={[styles.advStatCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                <Typo variant="h2" weight="black" color={team.color || Colors.france.blue}>54%</Typo>
                                <Typo variant="caption" color={subText}>Possession</Typo>
                            </View>
                            <View style={[styles.advStatCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                <Typo variant="h2" weight="black" color={team.color || Colors.france.blue}>3.2</Typo>
                                <Typo variant="caption" color={subText}>xGoals/Match</Typo>
                            </View>
                            <View style={[styles.advStatCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                <Typo variant="h2" weight="black" color={team.color || Colors.france.blue}>88%</Typo>
                                <Typo variant="caption" color={subText}>Penalty Kill</Typo>
                            </View>
                            <View style={[styles.advStatCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                <Typo variant="h2" weight="black" color={team.color || Colors.france.blue}>24%</Typo>
                                <Typo variant="caption" color={subText}>Power Play</Typo>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
                            <View style={[styles.lockedContainer, { backgroundColor: colorMode === 'dark' ? '#1e293b' : Colors.snowSecondary, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                                <Typo variant="h4" weight="black" color={text}>Débloquer les Stats PRO</Typo>
                                <Typo variant="caption" color={subText}>Accédez aux datas exclusives de {team.name}</Typo>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Last Match */}
                {lastMatch && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typo variant="h3" weight="black" color={text}>Dernier Résultat</Typo>
                        </View>
                        <MatchCard match={lastMatch} />
                    </View>
                )}

                {/* Schedule */}
                {futureMatches.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typo variant="h3" weight="black" color={text}>Calendrier</Typo>
                        </View>
                        {futureMatches.slice(0, 3).map(m => (
                            <View key={m.id} style={{ marginBottom: 12 }}>
                                <MatchCard match={m} />
                            </View>
                        ))}
                    </View>
                )}

                {/* Effectif */}
                {teamPlayers.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typo variant="h3" weight="black" color={text}>Effectif</Typo>
                        </View>
                        <RosterSection title="Gardiens" players={teamPlayers.filter(p => p.position === 'G')} color={team.color || Colors.france.blue} cardColor={card} textColor={text} subTextColor={subText} borderColor={colorMode === 'dark' ? '#334155' : Colors.slate} />
                        <RosterSection title="Défenseurs" players={teamPlayers.filter(p => p.position === 'D')} color={team.color || Colors.france.blue} cardColor={card} textColor={text} subTextColor={subText} borderColor={colorMode === 'dark' ? '#334155' : Colors.slate} />
                        <RosterSection title="Attaquants" players={teamPlayers.filter(p => p.position === 'F' || p.position === 'AG' || p.position === 'AD' || p.position === 'C')} color={team.color || Colors.france.blue} cardColor={card} textColor={text} subTextColor={subText} borderColor={colorMode === 'dark' ? '#334155' : Colors.slate} />
                    </View>
                )}
            </ScrollView>

            <SubscriptionModal
                visible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        marginBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: Colors.white,
    },
    content: {
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamHero: {
        marginHorizontal: 24,
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain'
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 16,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    formDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    advancedStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    advStatCard: {
        width: '46%',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    leadersRow: {
        flexDirection: 'row',
        gap: 10,
    },
    leaderCard: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        overflow: 'hidden',
    },
    leaderGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
    },
    leaderIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaderStatBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    lockedContainer: {
        backgroundColor: Colors.snowSecondary,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    rosterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    playerCard: {
        width: (width - 72) / 3,
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.slate,
        gap: 4,
    },
    playerAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 4,
        position: 'relative',
    },
    playerAvatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    numberBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    statusDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.white,
        zIndex: 2,
    }
});
