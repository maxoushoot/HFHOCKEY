import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors, Layout } from '../../constants/Colors';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../store/useStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useShallow } from 'zustand/react/shallow';

export const TeamStatusWidget = React.memo(() => {
    const theme = useTheme();
    const { teams, teamId, matches } = useStore(useShallow(state => ({
  teams: state.teams,
  teamId: state.teamId,
  matches: state.matches
})));
    const [imageError, setImageError] = React.useState(false);
    const router = useRouter();

    // Memoize computationally heavy tasks
    const { currentTeam, teamName, lastMatch } = useMemo(() => {
        const _currentTeam = teams.find(t => t.slug === teamId);
        const _teamName = _currentTeam ? _currentTeam.name.toUpperCase() : "MON ÉQUIPE";

        const _lastMatch = matches
            .filter((m: any) => (m.home_team?.slug === teamId || m.away_team?.slug === teamId) && m.status === 'finished')
            .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];

        return { currentTeam: _currentTeam, teamName: _teamName, lastMatch: _lastMatch };
    }, [teams, teamId, matches]);



    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />
                    <View>
                        <Typo style={styles.currentTeamLabel}>MA TEAM</Typo>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {teamName}
                        </Typo>
                    </View>
                </View>
                <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/my-team')}>
                    <Typo variant="caption" weight="bold" color={theme.primary}>VOIR TOUT</Typo>
                    <ChevronRight size={14} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Main Card: Last Match Result */}
                <View style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <Typo variant="caption" color={Colors.textSecondary} weight="bold">DERNIER MATCH</Typo>
                        <View style={styles.liveIndicator} />
                    </View>

                    <View style={styles.scoreBoard}>
                        {/* Team A (Us) */}
                        <View style={styles.teamColumn}>
                            <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
                                {currentTeam?.logo_url && !imageError ? (
                                    <Image
                                        source={{ uri: currentTeam.logo_url }}
                                        style={{ width: 28, height: 28, resizeMode: 'contain' }}
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <Typo variant="h3" weight="black" color={Colors.white}>
                                        {teamName.charAt(0)}
                                    </Typo>
                                )}
                            </View>
                            <Typo variant="h1" weight="black" color={Colors.night} style={styles.scoreText}>4</Typo>
                        </View>

                        {/* VS Separator */}
                        <View style={styles.vsContainer}>
                            <Typo variant="caption" weight="black" color={Colors.textSecondary}>VS</Typo>
                        </View>

                        {/* Team B (Opponent) */}
                        <View style={styles.teamColumn}>
                            <Typo variant="h1" weight="black" color={Colors.textSecondary} style={styles.scoreText}>1</Typo>
                            <View style={[styles.logoPlaceholder, { backgroundColor: '#F2F2F7' }]}>
                                <Typo variant="h3" weight="black" color="#8E8E93">A</Typo>
                            </View>
                        </View>
                    </View>

                    {/* Action Link */}
                    <TouchableOpacity
                        style={styles.actionLink}
                        onPress={() => lastMatch ? router.push(`/match/${lastMatch.id}`) : router.push('/calendar')}
                    >
                        <Typo variant="caption" weight="black" color={Colors.night}>VOIR LE RÉSUMÉ</Typo>
                    </TouchableOpacity>
                </View>

                {/* Side Card: MVP Focus */}
                <View style={[styles.mvpCard]}>
                    <View style={styles.mvpLabel}>
                        <Trophy size={12} color={Colors.gold} fill={Colors.gold} />
                        <Typo variant="caption" weight="black" color={Colors.gold} style={{ fontSize: 10 }}>MVP</Typo>
                    </View>

                    <View style={styles.mvpAvatar}>
                        <Typo variant="h3" weight="black" color={theme.primary}>23</Typo>
                    </View>

                    <View style={styles.mvpInfo}>
                        <Typo variant="label" weight="black" color={Colors.night} numberOfLines={1}>Gutierrez</Typo>
                        <Typo variant="caption" color={Colors.textSecondary} style={{ fontSize: 10 }}>98% Arrêts</Typo>
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    accentBar: {
        width: 4,
        height: 24,
        borderRadius: 2,
    },
    currentTeamLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    content: {
        flexDirection: 'row',
        gap: 16,
    },
    mainCard: {
        flex: 2, // Take 2/3 width
        backgroundColor: Colors.white,
        borderRadius: Layout.radius['2xl'],
        padding: 20,
        justifyContent: 'space-between',
        // Premium Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        backgroundColor: '#34C759', // Success Green
        borderRadius: 4,
    },
    scoreBoard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teamColumn: {
        alignItems: 'center',
        gap: 4,
    },
    logoPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    scoreText: {
        fontSize: 36,
        letterSpacing: -1,
        lineHeight: 40,
        marginBottom: -4,
    },
    vsContainer: {
        opacity: 0.2,
        transform: [{ translateY: 0 }],
    },
    actionLink: {
        marginTop: 16,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mvpCard: {
        flex: 1, // Take 1/3 width
        backgroundColor: Colors.white,
        borderRadius: Layout.radius['2xl'],
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        // Shadow (Subtle)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
    },
    mvpLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF9E6', // Gold 50
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    mvpAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 3,
        borderColor: Colors.white,
        zIndex: 10,
    },
    mvpInfo: {
        alignItems: 'center',
    },
});
