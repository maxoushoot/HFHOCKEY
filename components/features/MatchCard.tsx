import React, { memo } from 'react';
import { Bounceable } from '../ui/Bounceable';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { Typo } from '../ui/Typography';
import { Colors, CardStyles } from '../../constants/Colors';
import { useTeamTheme } from '../../hooks/useTeamTheme';
import { TouchableOpacity } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

interface MatchCardProps {
    match: any;
}

export const MatchCard = memo(({ match }: MatchCardProps) => {
    const router = useRouter();
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const { primary } = useTeamTheme();
    const { card, text, subText, colorMode } = useTheme();

    if (!homeTeam || !awayTeam) return null;

    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';

    return (
        <Bounceable
            scale={0.98}
            onPress={() => router.push(`/match/${match.id}`)}
        >
            <View style={[styles.container, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate, overflow: 'hidden' }]}>
                {/* Team Glows for Immersive Effect */}
                <View style={[styles.glow, { backgroundColor: homeTeam.color, left: -40, top: -40, opacity: colorMode === 'dark' ? 0.2 : 0.08 }]} />
                <View style={[styles.glow, { backgroundColor: awayTeam.color, right: -40, bottom: -40, opacity: colorMode === 'dark' ? 0.2 : 0.08 }]} />

                {/* Header Status */}
                <View style={styles.header}>
                    {isLive ? (
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Typo variant="caption" weight="black" color={Colors.france.red}>
                                EN DIRECT • {match.period}
                            </Typo>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={[styles.statusBadge, isFinished && styles.finishedBadge]}>
                                <Typo variant="caption" weight="bold" color={isFinished ? subText : primary}>
                                    {isFinished ? 'TERMINÉ' : (match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'À VENIR')}
                                </Typo>
                            </View>

                            {/* Special Badges */}
                            {match.is_derby && (
                                <View style={styles.derbyBadge}>
                                    <Typo variant="caption" weight="black" color={Colors.white}>DERBY</Typo>
                                </View>
                            )}
                            {match.is_key_match && (
                                <View style={styles.keyMatchBadge}>
                                    <Typo variant="caption" weight="black" color={Colors.night}>MATCH CLÉ</Typo>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Teams & Score */}
                <View style={styles.content}>
                    <TeamBlock team={homeTeam} color={text} white={card} />

                    <View style={styles.scoreBoard}>
                        {match.status !== 'scheduled' ? (
                            <>
                                <Typo variant="h2" weight="black" color={text} style={styles.score}>
                                    {match.home_score}
                                </Typo>
                                <Typo variant="h3" color={subText} style={{ opacity: 0.3 }}>-</Typo>
                                <Typo variant="h2" weight="black" color={text} style={styles.score}>
                                    {match.away_score}
                                </Typo>
                            </>
                        ) : (
                            <Typo variant="h3" weight="black" color={subText} style={{ opacity: 0.4 }}>
                                VS
                            </Typo>
                        )}
                    </View>

                    <TeamBlock team={awayTeam} color={text} white={card} />
                </View>
            </View>
        </Bounceable>
    );
}, (prev, next) => {
    return prev.match.id === next.match.id &&
        prev.match.status === next.match.status &&
        prev.match.home_score === next.match.home_score &&
        prev.match.away_score === next.match.away_score;
});

const TeamBlock = memo(({ team, color, white }: { team: any, color: string, white: string }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.team}
            onPress={(e) => {
                e.stopPropagation();
                if (team.slug) router.push(`/team/${team.slug}`);
            }}
        >
            <View style={[styles.logoCircle, { backgroundColor: team.color }]}>
                {team.logo_url ? (
                    <Image
                        source={{ uri: team.logo_url }}
                        style={{ width: 32, height: 32 }}
                        contentFit="contain"
                    />
                ) : (
                    <Typo variant="h3" weight="black" color={white}>
                        {team.name.charAt(0)}
                    </Typo>
                )}
            </View>
            <Typo variant="caption" weight="bold" color={color} numberOfLines={1}>
                {team.name.toUpperCase()}
            </Typo>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        ...CardStyles.base,
        padding: 18,
        borderWidth: 1, // Ensure border for dark mode
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    // ... keep other styles but remove fixed colors where simpler
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.france.red + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.france.red + '30',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.france.red,
    },
    statusBadge: {
        backgroundColor: Colors.france.blue + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    finishedBadge: {
        backgroundColor: Colors.slate,
    },
    derbyBadge: {
        backgroundColor: Colors.france.red,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    keyMatchBadge: {
        backgroundColor: Colors.gold,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    team: {
        flex: 1,
        gap: 10,
        alignItems: 'center',
    },
    scoreBoard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 8,
    },
    score: {
        fontSize: 28,
        letterSpacing: -1,
    },
    logoCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
});
