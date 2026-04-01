import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, StatusBar, Dimensions } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { PuckRunner } from '../../components/game/PuckRunner';
import { QuizGame } from '../../components/game/QuizGame';
import { FantasyLeague } from '../../components/game/FantasyLeague';
import { useStore } from '../../store/useStore';
import { getLevel, GAME_SCORING } from '../../utils/game-logic';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { Gamepad2, Brain, Zap, Trophy, Target, Star, Play, X, ChevronRight, Flame, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useShallow } from 'zustand/react/shallow';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameType = 'puck' | 'quiz' | 'fantasy' | null;

const GAMES = [
    {
        id: 'puck' as const,
        name: 'Puck Runner',
        description: 'Glisse entre les obstacles et collecte les palets !',
        longDesc: 'Esquive les freezers et ramasse un maximum de palets pour gagner des points.',
        icon: Gamepad2,
        color: '#3B82F6',
        gradientColors: ['#3B82F6', '#1D4ED8'] as const,
        bgColor: '#DBEAFE',
        xpMultiplier: '×2',
    },
    {
        id: 'quiz' as const,
        name: 'Quiz Hockey',
        description: 'Teste tes connaissances sur le hockey',
        longDesc: 'Questions sur l\'histoire, les règles et les joueurs de la Ligue Magnus.',
        icon: Brain,
        color: '#9333EA',
        gradientColors: ['#9333EA', '#6B21A8'] as const,
        bgColor: '#F3E8FF',
        xpMultiplier: '×10',
    },
    {
        id: 'fantasy' as const,
        name: 'Ligue Fantasy',
        description: 'Crée ton équipe de rêve',
        longDesc: 'Sélectionne les meilleurs joueurs et gagne des points selon leurs performances.',
        icon: Target,
        color: '#65A30D',
        gradientColors: ['#65A30D', '#3F6212'] as const,
        bgColor: '#ECFCCB',
        xpMultiplier: '×1',
    },
];

/**
 * Games Hub - Full screen game modes with XP rewards.
 */
export default function GameScreen() {
    const { profile, updateXP } = useStore(useShallow(state => ({
  profile: state.profile,
  updateXP: state.updateXP
})));
    const [activeGame, setActiveGame] = useState<GameType>(null);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const insets = useSafeAreaInsets();
    const { text, card, background, subText, colorMode } = useTheme();

    const handleScore = useCallback(async (score: number) => {
        setLastScore(score);
        const xpEarned = activeGame && GAME_SCORING[activeGame] ? GAME_SCORING[activeGame](score) : 0;
        if (xpEarned > 0) {
            await updateXP(xpEarned);
        }
    }, [activeGame, updateXP]);

    const closeGame = useCallback(() => {
        setActiveGame(null);
        setLastScore(null);
    }, []);

    const xp = profile?.xp || 0;
    const level = getLevel(xp);
    const nextLevelXP = (level + 1) * 100;
    const progress = Math.min((xp % 100) / 100, 1);
    const isDark = colorMode === 'dark';
    const borderColor = isDark ? '#334155' : Colors.slate;

    // Featured game of the day (rotates)
    const dayIndex = new Date().getDay() % GAMES.length;
    const featuredGame = GAMES[dayIndex];

    return (
        <>
            <LiquidContainer style={{ backgroundColor: background }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Typo variant="h1" weight="black" color={text}>Arcade</Typo>
                            <Typo variant="caption" color={subText}>Joue et gagne de l'XP !</Typo>
                        </View>
                        <View style={[styles.xpBadge, { backgroundColor: card, borderColor }]}>
                            <Zap size={16} color={Colors.gold} fill={Colors.gold} />
                            <Typo variant="body" weight="black" color={text}>
                                {xp} XP
                            </Typo>
                        </View>
                    </View>

                    {/* Level Card with Progress Bar */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View style={[styles.levelCard, { overflow: 'hidden' }]}>
                            <LinearGradient
                                colors={['#0F172A', '#1E293B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View style={styles.levelContent}>
                                <View style={styles.levelLeft}>
                                    <View style={styles.levelBadge}>
                                        <Typo variant="h1" weight="black" color={Colors.white}>{level}</Typo>
                                    </View>
                                    <View style={styles.levelInfo}>
                                        <Typo variant="h3" weight="bold" color={Colors.white}>Niveau {level}</Typo>
                                        <Typo variant="caption" color="rgba(255,255,255,0.5)">{xp} / {nextLevelXP} XP</Typo>
                                    </View>
                                </View>
                                <Trophy size={28} color="rgba(255,255,255,0.15)" />
                            </View>
                            {/* Progress bar */}
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Daily Challenge */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <TouchableOpacity
                            style={[styles.dailyChallengeCard, { overflow: 'hidden' }]}
                            onPress={() => setActiveGame(featuredGame.id)}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[featuredGame.gradientColors[0], featuredGame.gradientColors[1]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View style={styles.dailyContent}>
                                <View style={styles.dailyBadge}>
                                    <Flame size={14} color={Colors.white} />
                                    <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 10, letterSpacing: 1 }}>DÉFI DU JOUR</Typo>
                                </View>
                                <Typo variant="h2" weight="black" color={Colors.white}>{featuredGame.name}</Typo>
                                <Typo variant="caption" color="rgba(255,255,255,0.8)">{featuredGame.longDesc}</Typo>
                                <View style={styles.dailyPlayRow}>
                                    <View style={styles.dailyPlayBtn}>
                                        <Play size={14} color={Colors.white} fill={Colors.white} />
                                        <Typo variant="body" weight="black" color={Colors.white}>JOUER</Typo>
                                    </View>
                                    <View style={styles.dailyXpTag}>
                                        <Zap size={12} color={Colors.gold} fill={Colors.gold} />
                                        <Typo variant="caption" weight="black" color={Colors.gold}>{featuredGame.xpMultiplier} XP</Typo>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Games Section */}
                    <View style={styles.sectionHeader}>
                        <Typo variant="h2" weight="black" color={text}>Tous les jeux</Typo>
                        <View style={[styles.gamesCount, { backgroundColor: isDark ? '#1E293B' : Colors.france.blue + '10' }]}>
                            <Typo variant="caption" weight="bold" color={Colors.france.blue}>{GAMES.length} modes</Typo>
                        </View>
                    </View>

                    {/* Game Cards */}
                    <View style={styles.gamesGrid}>
                        {GAMES.map((game, index) => {
                            const Icon = game.icon;
                            return (
                                <Animated.View key={game.id} entering={FadeInDown.duration(300).delay(300 + index * 80)}>
                                    <TouchableOpacity
                                        style={[styles.gameCard, { backgroundColor: card, borderColor }]}
                                        onPress={() => setActiveGame(game.id)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={styles.gameCardInner}>
                                            <View style={[styles.gameIconWrap, { backgroundColor: game.bgColor }]}>
                                                <Icon size={28} color={game.color} />
                                            </View>
                                            <View style={styles.gameInfo}>
                                                <View style={styles.gameHeader}>
                                                    <Typo variant="h3" weight="bold" color={text}>{game.name}</Typo>
                                                    <View style={[styles.xpTag, { backgroundColor: isDark ? game.color + '20' : game.bgColor }]}>
                                                        <Zap size={10} color={game.color} />
                                                        <Typo variant="caption" weight="bold" color={game.color}>{game.xpMultiplier}</Typo>
                                                    </View>
                                                </View>
                                                <Typo variant="caption" color={subText}>{game.description}</Typo>
                                            </View>
                                            <LinearGradient
                                                colors={[game.gradientColors[0], game.gradientColors[1]]}
                                                style={styles.playBtn}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <Play size={16} color={Colors.white} fill={Colors.white} />
                                            </LinearGradient>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Tips */}
                    <View style={[styles.tipsCard, { backgroundColor: isDark ? '#1E293B' : Colors.france.blue + '08', borderColor: isDark ? '#334155' : Colors.france.blue + '15' }]}>
                        <Typo variant="body" weight="bold" color={Colors.france.blue}>💡 Astuce</Typo>
                        <Typo variant="caption" color={subText} style={{ marginTop: 4 }}>
                            Les Quiz rapportent le plus d'XP ! Réponds correctement pour gagner ×10 points.
                        </Typo>
                    </View>
                </ScrollView>
            </LiquidContainer>

            {/* Full Screen Game Modal */}
            <Modal
                visible={activeGame !== null}
                animationType="slide"
                presentationStyle="fullScreen"
                statusBarTranslucent
            >
                <View style={[styles.fullScreenGame, { paddingTop: insets.top }]}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles.closeBtn, { top: insets.top + 10 }]}
                        onPress={closeGame}
                    >
                        <X size={24} color="#535353" />
                    </TouchableOpacity>

                    {/* Game Content */}
                    <View style={styles.gameContent}>
                        {activeGame === 'puck' && (
                            <PuckRunner onScore={handleScore} onClose={closeGame} />
                        )}
                        {activeGame === 'quiz' && (
                            <QuizGame onScore={handleScore} />
                        )}
                        {activeGame === 'fantasy' && (
                            <FantasyLeague onScore={handleScore} />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        marginBottom: 24,
    },
    xpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
    },
    levelCard: {
        marginHorizontal: 24,
        borderRadius: 24,
        marginBottom: 20,
    },
    levelContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    levelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    levelBadge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    levelInfo: {
        gap: 2,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressBarFill: {
        height: 4,
        backgroundColor: Colors.gold,
        borderRadius: 2,
    },

    // Daily Challenge
    dailyChallengeCard: {
        marginHorizontal: 24,
        borderRadius: 24,
        marginBottom: 28,
    },
    dailyContent: {
        padding: 24,
        gap: 8,
    },
    dailyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    dailyPlayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    dailyPlayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    dailyXpTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    gamesCount: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    gamesGrid: {
        paddingHorizontal: 24,
        gap: 14,
    },
    gameCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    gameCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    gameIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameInfo: {
        flex: 1,
        gap: 4,
    },
    gameHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    xpTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    playBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipsCard: {
        marginHorizontal: 24,
        marginTop: 24,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },

    // Full Screen Game
    fullScreenGame: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    gameContent: {
        flex: 1,
    },
});
