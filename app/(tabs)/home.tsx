import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { HeroCard, HeroCardMatch } from '../../components/features/HeroCard';
import { MatchCard } from '../../components/features/MatchCard';
import { NewsCarousel } from '../../components/features/NewsCarousel';
import { TeamStatusWidget } from '../../components/features/TeamStatusWidget';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/Colors';
import { Bell, ChevronRight, Trophy, Star } from 'lucide-react-native';

/**
 * Écran d'Accueil - Design épuré et premium.
 */
export default function HomeScreen() {
    const { matches, fetchMatches, profile, teamId } = useStore();

    useEffect(() => {
        fetchMatches();
    }, []);

    const featuredMatch = matches.find((m: any) => m.is_featured);

    const favoriteMatch = teamId
        ? matches.find((m: any) =>
            (m.home_team?.slug === teamId || m.away_team?.slug === teamId) &&
            (m.status === 'live' || m.status === 'scheduled')
        )
        : null;

    const nextMatch = featuredMatch || favoriteMatch || matches.find((m: any) => m.status === 'live' || m.status === 'scheduled') || null;

    return (
        <LiquidContainer>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Typo variant="caption" weight="bold" color={Colors.textSecondary}>
                            Bienvenue sur
                        </Typo>
                        <View style={{ flexDirection: 'row' }}>
                            <Typo variant="h1" weight="black" color={Colors.france.blue}>Hockey </Typo>
                            <Typo variant="h1" weight="black" color={Colors.france.red}>Français</Typo>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.notifBtn}
                        onPress={() => router.push('/notifications')}
                        accessibilityLabel="Voir les notifications"
                        accessibilityRole="button"
                    >
                        <Bell color={Colors.night} size={20} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Trophy size={20} color={Colors.gold} />
                        <View>
                            <Typo variant="h3" weight="black" color={Colors.night}>
                                {profile?.matches_watched || 0}
                            </Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>Matchs vus</Typo>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Star size={20} color={Colors.france.blue} />
                        <View>
                            <Typo variant="h3" weight="black" color={Colors.night}>
                                {profile?.level || 1}
                            </Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>Niveau</Typo>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickActionsScroll}
                >
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors.france.blue }]}
                        onPress={() => router.push('/game')}
                    >
                        <View style={styles.actionIcon}>
                            <Trophy size={24} color={Colors.white} />
                        </View>
                        <View>
                            <Typo variant="body" weight="black" color={Colors.white}>Fantasy</Typo>
                            <Typo variant="caption" color="rgba(255,255,255,0.8)">Mon Équipe</Typo>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
                        onPress={() => { /* router.push('/betting') */ }}
                    >
                        <View style={styles.actionIcon}>
                            <Star size={24} color={Colors.white} />
                        </View>
                        <View>
                            <Typo variant="body" weight="black" color={Colors.white}>Paris</Typo>
                            <Typo variant="caption" color="rgba(255,255,255,0.8)">Cotes & Gains</Typo>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#EC4899' }]}
                        onPress={() => { /* router.push('/shop') */ }}
                    >
                        <View style={styles.actionIcon}>
                            <View style={styles.shopBadge}><Typo variant="caption" weight="black" color="#EC4899" style={{ fontSize: 8 }}>NEW</Typo></View>
                            <Star size={24} color={Colors.white} />
                        </View>
                        <View>
                            <Typo variant="body" weight="black" color={Colors.white}>Boutique</Typo>
                            <Typo variant="caption" color="rgba(255,255,255,0.8)">Maillots & +</Typo>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* Hero Card */}
                <View style={styles.heroSection}>
                    <View style={styles.sectionHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            Prochain Match
                        </Typo>
                    </View>
                    <HeroCard match={nextMatch || ({
                        id: 'dummy',
                        status: 'scheduled',
                        home_team: { name: 'Grenoble', color: '#003399' },
                        away_team: { name: 'Rouen', color: '#FFD700' }
                    } as unknown as HeroCardMatch)} />
                </View>

                {/* Team Status */}
                <TeamStatusWidget />

                {/* News */}
                <NewsCarousel />

                {/* Upcoming Matches */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            À l'affiche
                        </Typo>
                        <TouchableOpacity
                            style={styles.seeAllBtn}
                            onPress={() => router.push('/matches')}
                            accessibilityLabel="Voir tous les matchs"
                            accessibilityRole="button"
                        >
                            <Typo variant="caption" weight="bold" color={Colors.france.blue}>
                                Voir tout
                            </Typo>
                            <ChevronRight size={16} color={Colors.france.blue} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.matchesScroll}
                    >
                        {matches
                            .filter((m: any) => m.status === 'live' || m.status === 'scheduled')
                            .slice(0, 5)
                            .map((match: any) => (
                                <View key={match.id} style={{ width: 280 }}>
                                    <MatchCard match={match} />
                                </View>
                            ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        marginBottom: 20,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    heroSection: {
        marginBottom: 8,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    matchesScroll: {
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 24, // Fix for shadow cutoff
    },
    quickActionsScroll: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
        width: 140,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: Colors.white,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
});

