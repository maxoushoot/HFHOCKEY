
import React, { useState, useEffect, memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { Calendar, Clock, MapPin, ChevronRight, Share2, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Bounceable } from '../ui/Bounceable';
import { useCountdown } from '../../hooks/useCountdown';
import { Match } from '../../types/database.types';

const { width } = Dimensions.get('window');

export type HeroCardMatch = Match & { 
    competition_name?: string, 
    status_short?: string,
    home_score?: number,
    away_score?: number,
    venue?: string,
    home_team?: { name: string, logo_url: string, slug: string, color: string },
    away_team?: { name: string, logo_url: string, slug: string, color: string }
};

/**
 * HeroCard - Completely Redesigned Next Match Experience
 * Theme: Immersive, Dynamic, High-Contrast
 */
export const HeroCard = memo(({ match }: { match: HeroCardMatch }) => {
    const router = useRouter();
    const { card, text, subText, colorMode } = useTheme();
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const countdown = useCountdown(match.scheduled_at);

    // ... (keep existing animation logic) 

    const pulseAnim = useSharedValue(0.4);
    useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.4, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const liveBadgeStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value,
    }));



    if (!homeTeam || !awayTeam) return null;

    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const isScheduled = match.status === 'scheduled';

    const handlePress = () => {
        if (match.id) router.push(`/match/${match.id}`);
    };

    const navigateToTeam = (slug: string) => {
        if (slug) router.push(`/team/${slug}`);
    };

    return (
        <Animated.View entering={FadeInDown.duration(800).springify()}>
            <Bounceable onPress={handlePress} scale={0.96}>
                <View style={[styles.container, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                    {/* Background Layer */}
                    <LinearGradient
                        colors={colorMode === 'dark' ? ['#0f172a', '#1e293b'] : ['#F0F9FF', Colors.white]}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    {/* Subtle Pattern/Image */}
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1512719994953-e9fef0cdd36d?q=80&w=1200' }}
                        style={[StyleSheet.absoluteFillObject, { opacity: colorMode === 'dark' ? 0.02 : 0.05 }]}
                        contentFit="cover"
                    />

                    {/* Color accents based on teams */}
                    <View style={[styles.glow, { backgroundColor: homeTeam.color, left: -50, top: -50, opacity: colorMode === 'dark' ? 0.15 : 0.08 }]} />
                    <View style={[styles.glow, { backgroundColor: awayTeam.color, right: -50, bottom: -50, opacity: colorMode === 'dark' ? 0.15 : 0.08 }]} />

                    <View style={styles.content}>
                        {/* Top Row: Meta info */}
                        <View style={styles.topRow}>
                            <View style={[styles.competitionBadge, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' }]}>
                                <Zap size={14} color={Colors.france.blue} fill={Colors.france.blue} />
                                <Typo variant="caption" weight="black" color={Colors.france.blue} style={{ letterSpacing: 0.5 }}>
                                    {match.competition_name || 'LIGUE MAGNUS'}
                                </Typo>
                            </View>

                            {isLive ? (
                                <Animated.View style={[styles.liveTag, liveBadgeStyle]}>
                                    <Typo variant="caption" weight="black" color={Colors.white}>LIVE</Typo>
                                </Animated.View>
                            ) : (
                                <View style={styles.timeInfo}>
                                    <Clock size={12} color={subText} />
                                    <Typo variant="caption" color={subText} style={{ fontVariant: ['tabular-nums'] }}>
                                        {countdown.h}:{countdown.m}:{countdown.s}
                                    </Typo>
                                </View>
                            )}
                        </View>

                        {/* Main Matchup: Teams Display */}
                        <View style={styles.matchup}>
                            {/* HOME TEAM */}
                            <TouchableOpacity
                                style={styles.teamSide}
                                onPress={(e) => { e.stopPropagation(); navigateToTeam(homeTeam.slug); }}
                            >
                                <View style={[
                                    styles.logoOuter,
                                    {
                                        shadowColor: colorMode === 'dark' ? '#000' : Colors.slate,
                                        backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : Colors.white
                                    }
                                ]}>
                                    <Image source={{ uri: homeTeam.logo_url }} style={styles.logo} contentFit="contain" />
                                </View>
                                <Typo variant="h4" weight="black" color={text} numberOfLines={1} style={styles.teamName}>
                                    {homeTeam.name.toUpperCase()}
                                </Typo>
                            </TouchableOpacity>

                            {/* CENTER SCORE / VS */}
                            <View style={styles.centerCol}>
                                {!isScheduled ? (
                                    <View style={styles.scoreRow}>
                                        <Typo variant="h1" weight="black" color={text} style={styles.scoreNum}>{match.home_score}</Typo>
                                        <Typo variant="h2" weight="black" color={subText}>:</Typo>
                                        <Typo variant="h1" weight="black" color={text} style={styles.scoreNum}>{match.away_score}</Typo>
                                    </View>
                                ) : (
                                    <View style={styles.vsContainer}>
                                        <Typo variant="h1" weight="black" color={subText} style={styles.vsLarge}>VS</Typo>
                                    </View>
                                )}

                                {isLive && (
                                    <View style={[styles.periodBox, { backgroundColor: Colors.france.red + '15' }]}>
                                        <Typo variant="caption" weight="black" color={Colors.france.red}>{match.status_short || 'P1'}</Typo>
                                    </View>
                                )}

                                {isFinished && (
                                    <View style={styles.finishedBadge}>
                                        <Typo variant="caption" weight="black" color={subText}>TERMINÉ</Typo>
                                    </View>
                                )}
                            </View>

                            {/* AWAY TEAM */}
                            <TouchableOpacity
                                style={styles.teamSide}
                                onPress={(e) => { e.stopPropagation(); navigateToTeam(awayTeam.slug); }}
                            >
                                <View style={[
                                    styles.logoOuter,
                                    {
                                        shadowColor: colorMode === 'dark' ? '#000' : Colors.slate,
                                        backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : Colors.white
                                    }
                                ]}>
                                    <Image source={{ uri: awayTeam.logo_url }} style={styles.logo} contentFit="contain" />
                                </View>
                                <Typo variant="h4" weight="black" color={text} numberOfLines={1} style={styles.teamName}>
                                    {awayTeam.name.toUpperCase()}
                                </Typo>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Row: Venue & Action */}
                        <View style={styles.bottomRow}>
                            <View style={styles.venue}>
                                <MapPin size={12} color={subText} />
                                <Typo variant="caption" color={subText} numberOfLines={1} style={{ maxWidth: width * 0.4 }}>
                                    {match.venue || 'Patinoire Principale'}
                                </Typo>
                            </View>

                            <View style={[styles.cta, { backgroundColor: Colors.france.blue, borderColor: Colors.france.blue }]}>
                                <Typo variant="caption" weight="black" color={Colors.white}>DÉTAILS</Typo>
                                <View style={[styles.ctaArrow, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <ChevronRight size={14} color={Colors.white} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Bounceable>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        height: 280,
        marginHorizontal: 16,
        borderRadius: 32,
        backgroundColor: Colors.white,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    competitionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    liveTag: {
        backgroundColor: Colors.france.red,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    matchup: {
        flex: 1, // Take all available space
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    teamSide: {
        width: '35%',
        alignItems: 'center',
        gap: 12,
    },
    logoOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        padding: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10, // Android relief
    },
    logoBlur: {
        flex: 1,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logo: {
        width: 50,
        height: 50,
    },
    teamName: {
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    centerCol: {
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreNum: {
        fontSize: 44,
        lineHeight: 52,
    },
    vsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    vsLarge: {
        fontSize: 56,
        fontStyle: 'italic',
    },
    periodBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    finishedBadge: {
        marginTop: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    venue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    ctaArrow: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
