
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { MatchHeader } from '../../components/match/MatchHeader';
import { LiveReactions } from '../../components/features/LiveReactions';
import { Colors } from '../../constants/Colors';
import { Typo } from '../../components/ui/Typography';
import { useStore } from '../../store/useStore';
import { Match } from '../../types/database.types';
import { MVPVote } from '../../components/game/MVPVote';
import { QuizGame } from '../../components/game/QuizGame';
import { ArrowLeft, X, Crown, ArrowRight, Trophy, Brain, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PredictionModal } from '../../components/game/PredictionModal';
import { MatchTabs } from '../../components/match/MatchTabs';
import GameTimeline from '../../components/features/GameTimeline';
import { MatchStats } from '../../components/match/MatchStats';
import { MatchLineups } from '../../components/match/MatchLineups';
import ConfettiCannon from 'react-native-confetti-cannon';
import { VotingModal, QuizModal } from '../../components/features/MatchModals';
import { useMatchData } from '../../hooks/useMatchData';
import { useShallow } from 'zustand/react/shallow';

const { width } = Dimensions.get('window');

/**
 * Écran Détail du Match - Version 'Feuille de Match' Complète
 */
export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const { mvpVotes, voteMVP, predictions, submitPrediction, gameEvents } = useStore(useShallow(state => ({
  mvpVotes: state.mvpVotes,
  voteMVP: state.voteMVP,
  predictions: state.predictions,
  submitPrediction: state.submitPrediction,
  gameEvents: state.gameEvents
})));
    const { match, refreshing, onRefresh, mockEvents, mockStats } = useMatchData(id as string);
    const [isVoteModalVisible, setIsVoteModalVisible] = useState(false);
    const [isPredictionModalVisible, setIsPredictionModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');
    const [showMatchQuiz, setShowMatchQuiz] = useState(false);

    const confettiRef = useRef<ConfettiCannon>(null);

    const hasVotedMVP = match ? !!mvpVotes[match.id] : false;
    const userPrediction = match ? predictions[match.id] : null;

    // Check if voting channel should be open (Simulated: 'live' status)
    const isLive = match?.status === 'live';
    const isScheduled = match?.status === 'scheduled';

    const onVoteMVP = (playerId: string) => {
        if (match) {
            voteMVP(match.id, playerId);
            setTimeout(() => {
                setIsVoteModalVisible(false);
                // Trigger confetti after modal closes
                setTimeout(() => {
                    confettiRef.current?.start();
                }, 300);
            }, 800);
        }
    };

    const onSubmitPrediction = (homeScore: number, awayScore: number) => {
        if (match) {
            submitPrediction(match.id, homeScore, awayScore);
            // Trigger confetti for prediction too
            setTimeout(() => {
                confettiRef.current?.start();
            }, 500);
        }
    };

    if (!match) return <LiquidContainer><View /></LiquidContainer>;

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Navigation (Floating & Glassmorphic) */}
            <View style={styles.floatingHeader}>
                <BlurView intensity={20} tint="dark" style={styles.blurBtn}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft color={Colors.white} size={22} />
                    </TouchableOpacity>
                </BlurView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.white}
                        title="Tirer pour rafraîchir"
                        titleColor={Colors.white}
                    />
                }
            >
                {/* 1. Header Match (Immersive) */}
                <MatchHeader match={match} />

                {/* 2. Tabs Switcher */}
                <View style={{ marginTop: -20, zIndex: 10 }}>
                    <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </View>

                {/* 3. Tab Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'summary' && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <GameTimeline
                                events={(gameEvents && gameEvents.length > 0) ? gameEvents : mockEvents}
                                homeTeamApiId={match.home_team?.api_id}
                                awayTeamApiId={match.away_team?.api_id}
                            />

                            {/* MVP Vote — visible for finished matches in summary */}
                            {match.status === 'finished' && (
                                <View style={{ marginTop: 20 }}>
                                    {hasVotedMVP ? (
                                        <MVPVote
                                            homeTeamId={match.home_team?.id}
                                            awayTeamId={match.away_team?.id}
                                            initialVotedId={mvpVotes[match.id]}
                                            readOnly={true}
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.actionCard}
                                            onPress={() => setIsVoteModalVisible(true)}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient
                                                colors={['#0F172A', '#1E293B']}
                                                style={styles.actionGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.iconContainer}>
                                                    <Crown size={22} color={Colors.gold} fill={Colors.gold} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Typo variant="h3" weight="black" color={Colors.white}>ÉLIRE LE MVP</Typo>
                                                    <Typo variant="caption" color={Colors.textSecondary} style={{ opacity: 0.8 }}>
                                                        Qui a été le meilleur joueur du match ?
                                                    </Typo>
                                                </View>
                                                <View style={styles.arrowContainer}>
                                                    <ArrowRight size={20} color={Colors.white} />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Match Quiz — quick quiz about the match */}
                            {(match.status === 'finished' || match.status === 'live') && (
                                <TouchableOpacity
                                    style={[styles.actionCard, { marginTop: 14 }]}
                                    onPress={() => setShowMatchQuiz(true)}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={['#9333EA', '#6B21A8']}
                                        style={styles.actionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={[styles.iconContainer, { borderColor: 'rgba(255,255,255,0.25)' }]}>
                                            <Brain size={22} color={Colors.white} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Typo variant="h3" weight="black" color={Colors.white}>QUIZ DU MATCH</Typo>
                                            <Typo variant="caption" color="rgba(255,255,255,0.7)">
                                                Teste tes connaissances • +10 XP
                                            </Typo>
                                        </View>
                                        <View style={[styles.arrowContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                            <Zap size={18} color={Colors.gold} fill={Colors.gold} />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    )}

                    {activeTab === 'stats' && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <MatchStats match={{ ...match, stats: match.stats || mockStats }} />
                        </Animated.View>
                    )}

                    {activeTab === 'lineups' && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <MatchLineups match={match} />
                        </Animated.View>
                    )}

                    {activeTab === 'fanzone' && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            {/* PRONOSTICS (Trigger for Scheduled) */}
                            {isScheduled && (
                                <View style={{ marginBottom: 20 }}>
                                    {userPrediction ? (
                                        <View style={styles.predictionCard}>
                                            <View style={styles.predictionHeader}>
                                                <Trophy size={16} color={Colors.gold} fill={Colors.gold} />
                                                <Typo variant="h4" weight="bold" color={Colors.night}>Mon Prono</Typo>
                                            </View>
                                            <View style={styles.predictionScore}>
                                                <Typo variant="h2" weight="black" color={Colors.night}>{userPrediction.home_score}</Typo>
                                                <Typo variant="h4" color={Colors.textSecondary}>-</Typo>
                                                <Typo variant="h2" weight="black" color={Colors.night}>{userPrediction.away_score}</Typo>
                                            </View>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.actionCard}
                                            onPress={() => setIsPredictionModalVisible(true)}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient
                                                colors={['#475569', Colors.night]}
                                                style={styles.actionGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.iconContainer}>
                                                    <Trophy size={22} color={Colors.white} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Typo variant="h3" weight="bold" color={Colors.white}>FAIRE UN PRONO</Typo>
                                                    <Typo variant="caption" color={Colors.textSecondary} style={{ opacity: 0.8 }}>
                                                        Devinez le score et gagnez +50 XP
                                                    </Typo>
                                                </View>
                                                <View style={styles.arrowContainer}>
                                                    <ArrowRight size={20} color={Colors.white} />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* MVP Trigger (Live only) */}
                            {isLive && (
                                <View style={{ marginBottom: 20 }}>
                                    {hasVotedMVP ? (
                                        <MVPVote
                                            homeTeamId={match.home_team?.id}
                                            awayTeamId={match.away_team?.id}
                                            initialVotedId={mvpVotes[match.id]}
                                            readOnly={true}
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.actionCard}
                                            onPress={() => setIsVoteModalVisible(true)}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient
                                                colors={[Colors.night, '#1e293b']}
                                                style={styles.actionGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.iconContainer}>
                                                    <Crown size={24} color={Colors.gold} fill={Colors.gold} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Typo variant="h3" weight="black" color={Colors.white}>ÉLIRE LE MVP</Typo>
                                                    <Typo variant="caption" color={Colors.textSecondary} style={{ opacity: 0.8 }}>
                                                        Qui a été le meilleur joueur ?
                                                    </Typo>
                                                </View>
                                                <View style={styles.arrowContainer}>
                                                    <ArrowRight size={20} color={Colors.white} />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Section: Ambiance (Live Reactions) */}
                            <LiveReactions matchId={match.id} />
                        </Animated.View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Voting Modal */}
            <VotingModal 
                visible={isVoteModalVisible} 
                onClose={() => setIsVoteModalVisible(false)} 
                match={match} 
                onVoteMVP={onVoteMVP} 
            />

            {/* Prediction Modal */}
            <PredictionModal
                visible={isPredictionModalVisible}
                onClose={() => setIsPredictionModalVisible(false)}
                onSubmit={onSubmitPrediction}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
            />

            {/* Confetti */}
            <ConfettiCannon
                count={200}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                ref={confettiRef}
                fadeOut={true}
            />

            {/* Match Quiz Modal */}
            <QuizModal 
                visible={showMatchQuiz} 
                onClose={() => setShowMatchQuiz(false)} 
                onScore={(score: number) => {
                    setShowMatchQuiz(false);
                    setTimeout(() => confettiRef.current?.start(), 300);
                }} 
            />

        </LiquidContainer >
    );
}

const styles = StyleSheet.create({
    floatingHeader: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 100,
    },
    blurBtn: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    scroll: {
        paddingTop: 0,
        paddingBottom: 40,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 20,
        marginTop: 10,
    },
    welcomeBanner: {
        marginBottom: 8,
        marginTop: 10,
    },
    actionCard: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginVertical: 4,
    },
    actionGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    arrowContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    predictionCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    predictionScore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
});
