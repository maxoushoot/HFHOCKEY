
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LiquidContainer } from '../components/ui/LiquidContainer';
import { Typo } from '../components/ui/Typography';
import { Colors, Layout } from '../constants/Colors';

const { width } = Dimensions.get('window');
import { useStore } from '../store/useStore';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Trophy, Calendar, Users, BarChart3, ChevronRight } from 'lucide-react-native';
import { MatchCard } from '../components/features/MatchCard';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionModal } from '../components/features/SubscriptionModal';
import { Lock, Sparkles } from 'lucide-react-native';
import { Bounceable } from '../components/ui/Bounceable';
import { RosterSection } from '../components/features/RosterSection';

export default function MyTeamScreen() {
    const router = useRouter();
    const { teamId, teams, matches, players, fetchMatches, fetchTeams, fetchPlayersForMatch, profile } = useStore();
    const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

    useEffect(() => {
        fetchMatches();
        fetchTeams();
    }, []);

    const team = teams.find(t => t.slug === teamId) || {
        id: 'default',
        slug: 'bdl',
        name: 'Brûleurs de Loups',
        color: '#003399',
        secondary_color: '#FFD700',
        logo_url: ''
    };

    const teamPlayers = players.filter(p => p.team_id === team.id || teamId === 'bdl'); // Fallback for BDL if team_id missing in DB mock


    // Filter matches
    const teamMatches = matches.filter((m: any) =>
        m.home_team?.slug === teamId || m.away_team?.slug === teamId
    );

    const pastMatches = teamMatches.filter((m: any) => m.status === 'finished').reverse(); // Most recent first
    const futureMatches = teamMatches.filter((m: any) => m.status === 'scheduled' || m.status === 'live');

    const lastMatch = pastMatches[0];

    return (
        <LiquidContainer>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={Colors.night} size={24} />
                </TouchableOpacity>
                <Typo variant="h3" weight="black" color={Colors.night}>MA TEAM</Typo>
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
                    <View style={styles.logoContainer}>
                        {team.logo_url ? (
                            <Image source={{ uri: team.logo_url }} style={styles.logo} />
                        ) : (
                            <Typo variant="h1" style={{ fontSize: 40 }}>{team.name?.charAt(0)}</Typo>
                        )}
                    </View>
                    <Typo variant="h2" weight="black" color={Colors.white} style={{ textAlign: 'center', marginTop: 12 }}>
                        {team.name?.toUpperCase()}
                    </Typo>
                    <Typo variant="body" color="rgba(255,255,255,0.7)">Ligue Magnus</Typo>
                </View>

                {/* Quick Actions / Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Trophy size={20} color={Colors.gold} />
                        <Typo variant="h3" weight="black" color={Colors.night}>3ème</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>Classement</Typo>
                    </View>
                    <View style={styles.statCard}>
                        <BarChart3 size={20} color={Colors.france.blue} />
                        <Typo variant="h3" weight="black" color={Colors.night}>42</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>Points</Typo>
                    </View>
                    <View style={styles.statCard}>
                        <Users size={20} color={Colors.france.red} />
                        <Typo variant="h3" weight="black" color={Colors.night}>23</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>Effectif</Typo>
                    </View>
                </View>

                {/* Advanced Stats (Premium) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Typo variant="h3" weight="black" color={Colors.night}>Stats Avancées</Typo>
                            {profile?.is_premium ? (
                                <LinearGradient
                                    colors={['#FDE68A', '#D97706']}
                                    style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}
                                >
                                    <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 10 }}>PRO</Typo>
                                </LinearGradient>
                            ) : (
                                <Lock size={16} color={Colors.textSecondary} />
                            )}
                        </View>
                    </View>

                    {profile?.is_premium ? (
                        <View style={styles.advancedStatsGrid}>
                            <View style={styles.advStatCard}>
                                <Typo variant="h2" weight="black" color={Colors.france.blue}>54%</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>Possession</Typo>
                            </View>
                            <View style={styles.advStatCard}>
                                <Typo variant="h2" weight="black" color={Colors.france.blue}>3.2</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>xGoals/Match</Typo>
                            </View>
                            <View style={styles.advStatCard}>
                                <Typo variant="h2" weight="black" color={Colors.france.blue}>88%</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>Penalty Kill</Typo>
                            </View>
                            <View style={styles.advStatCard}>
                                <Typo variant="h2" weight="black" color={Colors.france.blue}>24%</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>Power Play</Typo>
                            </View>
                        </View>
                    ) : (
                        <Bounceable onPress={() => setShowSubscriptionModal(true)}>
                            <View style={styles.lockedContainer}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                {/* Fake content blurred behind */}
                                <View style={[styles.advancedStatsGrid, { opacity: 0.3, filter: 'blur(4px)' }]}>
                                    <View style={styles.advStatCard}><Typo variant="h2">54%</Typo></View>
                                    <View style={styles.advStatCard}><Typo variant="h2">3.2</Typo></View>
                                    <View style={styles.advStatCard}><Typo variant="h2">88%</Typo></View>
                                    <View style={styles.advStatCard}><Typo variant="h2">24%</Typo></View>
                                </View>

                                <View style={styles.lockOverlay}>
                                    <View style={styles.lockIconCircle}>
                                        <Lock size={24} color={Colors.white} />
                                    </View>
                                    <Typo variant="h4" weight="black" color={Colors.night} style={{ marginTop: 12 }}>
                                        Débloquer les Stats
                                    </Typo>
                                    <Typo variant="caption" color={Colors.textSecondary}>
                                        Réservé aux membres Premium
                                    </Typo>
                                </View>
                            </View>
                        </Bounceable>
                    )}
                </View>

                {/* Last Match Analysis */}
                {lastMatch && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typo variant="h3" weight="black" color={Colors.night}>Dernier Match</Typo>
                            <TouchableOpacity onPress={() => router.push(`/match/${lastMatch.id}`)}>
                                <Typo variant="caption" weight="bold" color={Colors.france.blue}>Analyse</Typo>
                            </TouchableOpacity>
                        </View>
                        <MatchCard match={lastMatch} />
                    </View>
                )}

                {/* Upcoming */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>Calendrier</Typo>
                        <TouchableOpacity onPress={() => router.push('/matches')}>
                            <Calendar size={18} color={Colors.france.blue} />
                        </TouchableOpacity>
                    </View>
                    {futureMatches.slice(0, 3).map((match: any) => (
                        <View key={match.id} style={{ marginBottom: 12 }}>
                            <MatchCard match={match} />
                        </View>
                    ))}
                    {futureMatches.length === 0 && (
                        <Typo variant="body" color={Colors.textSecondary}>Aucun match prévu</Typo>
                    )}
                </View>

                {/* Roster Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>Effectif</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>{teamPlayers.length} Joueurs</Typo>
                    </View>

                    {/* Goalkeepers */}
                    <RosterSection
                        title="Gardiens"
                        players={teamPlayers.filter(p => p.position === 'G')}
                        color={Colors.france.blue}
                    />

                    {/* Defense */}
                    <RosterSection
                        title="Défenseurs"
                        players={teamPlayers.filter(p => p.position === 'D')}
                        color={Colors.france.red}
                    />

                    {/* Forwards */}
                    <RosterSection
                        title="Attaquants"
                        players={teamPlayers.filter(p => p.position === 'F')}
                        color={Colors.gold}
                    />
                </View>

                {/* Team Info / Arena Card */}
                <View style={styles.section}>
                    <View style={styles.arenaCard}>
                        <LinearGradient
                            colors={['#1e293b', Colors.night]}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.arenaInfo}>
                            <Typo variant="h4" weight="black" color={Colors.white}>POLESUD</Typo>
                            <Typo variant="caption" color="rgba(255,255,255,0.6)">Grenoble, France • Cap. 4,208</Typo>
                        </View>
                        <View style={styles.arenaBadge}>
                            <Typo variant="caption" weight="black" color={Colors.white}>ARENA</Typo>
                        </View>
                    </View>
                </View>





            </ScrollView>

            <SubscriptionModal
                visible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </LiquidContainer >
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
    teamHero: {
        marginHorizontal: 24,
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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
    performerCard: {
        width: 140,
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    performerHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    performerRank: {
        width: 24,
        height: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    performerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.slate,
        marginBottom: 4,
    },
    statBadge: {
        backgroundColor: Colors.france.blue + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        gap: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.france.blue + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    advancedStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    advStatCard: {
        width: '48%',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    lockedContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        position: 'relative',
        padding: 24, // Ensure height
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    lockIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    arenaCard: {
        height: 120,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingHorizontal: 24,
        position: 'relative',
    },
    arenaInfo: {
        zIndex: 1,
        gap: 4,
    },
    arenaBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    }
});
