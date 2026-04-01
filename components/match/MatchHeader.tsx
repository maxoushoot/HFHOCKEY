import React, { useEffect, memo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Match, Team } from '../../types/database.types';
import { useRouter } from 'expo-router';

interface MatchHeaderProps {
    match: Match;
}

export const MatchHeader = memo(({ match }: MatchHeaderProps) => {
    const { home_team: homeTeam, away_team: awayTeam } = match;

    if (!homeTeam || !awayTeam) return null;

    return (
        <View style={styles.container}>
            {/* Background Layer */}
            <View style={styles.backgroundLayer}>
                <View style={{ flex: 1, backgroundColor: '#0f172a' }} />
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1000&auto=format&fit=crop' }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    transition={500}
                    blurRadius={4}
                />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.9)', Colors.night]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Team Glows */}
                <View style={[styles.glow, { backgroundColor: homeTeam.color || Colors.primary, left: -50, top: -50, opacity: 0.3 }]} />
                <View style={[styles.glow, { backgroundColor: awayTeam.color || Colors.primary, right: -50, bottom: -50, opacity: 0.3 }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>

                {/* Status Badge */}
                <BlurView intensity={20} tint="light" style={styles.statusContainer}>
                    {match.status === 'live' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <LiveBadge />
                            <Typo variant="caption" weight="bold" color={Colors.white}>
                                {match.status_short || 'EN COURS'} • {match.period || ''}
                            </Typo>
                        </View>
                    ) : (
                        <Typo variant="caption" weight="bold" color="rgba(255,255,255,0.9)">
                            {match.status === 'scheduled' ? (
                                match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString().slice(0, 5) : 'À VENIR'
                            ) : (
                                `TERMINÉ ${match.status_short === 'AOT' ? '(PROL)' : match.status_short === 'AP' ? '(TAB)' : ''}`
                            )}
                        </Typo>
                    )}
                </BlurView>

                {/* Matchup */}
                <View style={styles.matchup}>
                    <TeamDisplay team={homeTeam} align="right" />

                    {/* Score center */}
                    <View style={styles.scoreContainer}>
                        {match.status === 'scheduled' ? (
                            <Typo variant="h1" weight="black" color="rgba(255,255,255,0.2)">VS</Typo>
                        ) : (
                            <>
                                <Typo variant="h1" weight="black" color={Colors.white} style={styles.score}>
                                    {match.home_score ?? 0}
                                </Typo>
                                <Typo variant="h3" color="rgba(255,255,255,0.4)">-</Typo>
                                <Typo variant="h1" weight="black" color={Colors.white} style={styles.score}>
                                    {match.away_score ?? 0}
                                </Typo>
                            </>
                        )}
                    </View>

                    <TeamDisplay team={awayTeam} align="left" />
                </View>

                {/* Period Scores or Date */}
                <View style={styles.timerContainer}>
                    {match.status === 'scheduled' ? (
                        <Typo variant="caption" weight="bold" color="rgba(255,255,255,0.8)">
                            {match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : ''}
                        </Typo>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {match.period_1 && <PeriodScore label="P1" score={match.period_1} />}
                            {match.period_2 && <PeriodScore label="P2" score={match.period_2} />}
                            {match.period_3 && <PeriodScore label="P3" score={match.period_3} />}
                            {match.overtime && <PeriodScore label="OT" score={match.overtime} />}
                            {match.penalties && <PeriodScore label="TAB" score={match.penalties} />}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
});

const PeriodScore = ({ label, score }: { label: string, score: string }) => (
    <View style={{ alignItems: 'center' }}>
        <Typo variant="caption" color="rgba(255,255,255,0.5)" style={{ fontSize: 10 }}>{label}</Typo>
        <Typo variant="caption" weight="bold" color={Colors.white}>{score}</Typo>
    </View>
);

// Extracted Sub-components

const LiveBadge = () => {
    const opacity = useSharedValue(0.4);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.4, { duration: 800 })
            ),
            -1,
            true
        );
    }, []);

    return (
        <View style={styles.liveBadge}>
            <Animated.View style={[styles.pulsingDot, animatedStyle]} />
            <Typo variant="caption" weight="black" color={Colors.white}>EN DIRECT</Typo>
        </View>
    );
};

const TeamDisplay = ({ team, align }: { team: Team, align: 'left' | 'right' }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.team}
            onPress={() => {
                if (team.slug) router.push(`/team/${team.slug}`);
            }}
        >
            <View style={[styles.logo, { borderColor: 'rgba(255,255,255,0.1)', shadowColor: team.color }]}>
                {team.logo_url ? (
                    <Image
                        source={{ uri: team.logo_url }}
                        style={styles.teamImage}
                        contentFit="contain"
                        transition={300}
                    />
                ) : (
                    <Typo variant="h2" weight="black" color={team.color}>{team.name.charAt(0)}</Typo>
                )}
            </View>
            <Typo variant="h3" weight="black" color={Colors.white} numberOfLines={1} style={styles.teamName}>
                {team.name.toUpperCase()}
            </Typo>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 320,
        justifyContent: 'flex-end',
        paddingBottom: 30,
        backgroundColor: Colors.night,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        zIndex: 1,
        marginBottom: -20,
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 20,
    },
    statusContainer: {
        overflow: 'hidden',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.alertRed,
    },
    matchup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    team: {
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    teamImage: {
        width: 48,
        height: 48,
    },
    teamName: {
        fontSize: 14,
        textAlign: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 80,
        justifyContent: 'center',
    },
    score: {
        fontSize: 48,
        lineHeight: 56,
    },
    timerContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    }
});
