import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { MatchHeader } from '../../components/match/MatchHeader';
import { LiveReactions } from '../../components/features/LiveReactions';
import { Colors } from '../../constants/Colors';
import { Typo } from '../../components/ui/Typography';
import { useStore } from '../../store/useStore';
import { MVPVote } from '../../components/game/MVPVote';
import { ArrowLeft, Crown, Trophy, Brain, Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { PredictionModal } from '../../components/game/PredictionModal';
import { MatchTabs } from '../../components/match/MatchTabs';
import GameTimeline from '../../components/features/GameTimeline';
import { MatchStats } from '../../components/match/MatchStats';
import { MatchLineups } from '../../components/match/MatchLineups';
import { VotingModal } from '../../components/modals/VotingModal';
import { QuizModal } from '../../components/modals/QuizModal';
import { useMatchData } from '../../hooks/useMatchData';
import { useShallow } from 'zustand/react/shallow';
import { MatchActionCard } from '../../components/hockey/MatchActionCard';
import { useMatchDetailActions } from '../../hooks/useMatchDetailActions';
import ConfettiCannon from 'react-native-confetti-cannon';

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

    const hasVotedMVP = match ? !!mvpVotes[match.id] : false;
    const userPrediction = match ? predictions[match.id] : null;
    const {
        activeTab,
        setActiveTab,
        isVoteModalVisible,
        setIsVoteModalVisible,
        isPredictionModalVisible,
        setIsPredictionModalVisible,
        showMatchQuiz,
        setShowMatchQuiz,
        confettiRef,
        onVoteMVP,
        onSubmitPrediction,
    } = useMatchDetailActions({
        matchId: match?.id,
        voteMVP,
        submitPrediction,
    });

    const isLive = match?.status === 'live';
    const isScheduled = match?.status === 'scheduled';


    if (!match) return <LiquidContainer><View /></LiquidContainer>;

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.floatingHeader}>
                <BlurView intensity={20} tint="dark" style={styles.blurBtn}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
                <MatchHeader match={match} />

                <View style={{ marginTop: -20, zIndex: 10 }}>
                    <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </View>

                <View style={styles.contentContainer}>
                    {activeTab === 'summary' && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <GameTimeline
                                events={(gameEvents && gameEvents.length > 0) ? gameEvents : mockEvents}
                                homeTeamApiId={match.home_team?.api_id}
                                awayTeamApiId={match.away_team?.api_id}
                            />

                            {match.status === 'finished' && (
                                <View style={{ marginTop: 20 }}>
                                    {hasVotedMVP ? (
                                        <MVPVote
                                            homeTeamId={match.home_team?.id}
                                            awayTeamId={match.away_team?.id}
                                            initialVotedId={mvpVotes[match.id]}
                                            readOnly
                                        />
                                    ) : (
                                        <MatchActionCard
                                            title="ÉLIRE LE MVP"
                                            subtitle="Qui a été le meilleur joueur du match ?"
                                            icon={<Crown size={22} color={Colors.gold} fill={Colors.gold} />}
                                            colors={['#0F172A', '#1E293B']}
                                            onPress={() => setIsVoteModalVisible(true)}
                                        />
                                    )}
                                </View>
                            )}

                            {(match.status === 'finished' || match.status === 'live') && (
                                <MatchActionCard
                                    title="QUIZ DU MATCH"
                                    subtitle="Teste tes connaissances • +10 XP"
                                    icon={<Brain size={22} color={Colors.white} />}
                                    colors={['#9333EA', '#6B21A8']}
                                    rightElement={<Zap size={18} color={Colors.gold} fill={Colors.gold} />}
                                    onPress={() => setShowMatchQuiz(true)}
                                />
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
                                        <MatchActionCard
                                            title="FAIRE UN PRONO"
                                            subtitle="Devinez le score et gagnez +50 XP"
                                            icon={<Trophy size={22} color={Colors.white} />}
                                            colors={['#475569', Colors.night]}
                                            onPress={() => setIsPredictionModalVisible(true)}
                                        />
                                    )}
                                </View>
                            )}

                            {isLive && (
                                <View style={{ marginBottom: 20 }}>
                                    {hasVotedMVP ? (
                                        <MVPVote
                                            homeTeamId={match.home_team?.id}
                                            awayTeamId={match.away_team?.id}
                                            initialVotedId={mvpVotes[match.id]}
                                            readOnly
                                        />
                                    ) : (
                                        <MatchActionCard
                                            title="ÉLIRE LE MVP"
                                            subtitle="Qui a été le meilleur joueur ?"
                                            icon={<Crown size={24} color={Colors.gold} fill={Colors.gold} />}
                                            colors={[Colors.night, '#1e293b']}
                                            onPress={() => setIsVoteModalVisible(true)}
                                        />
                                    )}
                                </View>
                            )}

                            <LiveReactions matchId={match.id} />
                        </Animated.View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <VotingModal
                visible={isVoteModalVisible}
                onClose={() => setIsVoteModalVisible(false)}
                match={match}
                onVoteMVP={onVoteMVP}
            />

            <PredictionModal
                visible={isPredictionModalVisible}
                onClose={() => setIsPredictionModalVisible(false)}
                onSubmit={onSubmitPrediction}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
            />

            <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} autoStart={false} ref={confettiRef} fadeOut />

            <QuizModal
                visible={showMatchQuiz}
                onClose={() => setShowMatchQuiz(false)}
                onScore={() => {
                    setShowMatchQuiz(false);
                    setTimeout(() => confettiRef.current?.start(), 300);
                }}
            />
        </LiquidContainer>
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
        paddingBottom: 40,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 20,
        marginTop: 10,
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
