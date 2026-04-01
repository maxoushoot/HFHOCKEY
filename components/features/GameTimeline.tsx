import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { GameEvent } from '../../types/database.types';
import { Typo } from '../ui/Typography';
import { Target, AlertTriangle, Clock, ChevronDown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface GameTimelineProps {
    events: GameEvent[];
    homeTeamApiId?: number;
    awayTeamApiId?: number;
}

/**
 * GameTimeline — Premium Match Summary Experience
 */
export default function GameTimeline({ events, homeTeamApiId, awayTeamApiId }: GameTimelineProps) {
    if (!events || events.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Typo variant="caption" color="rgba(255,255,255,0.4)">Aucun événement disponible pour le moment</Typo>
            </View>
        );
    }

    // Group events by period
    const grouped = events.reduce((acc, event) => {
        const p = event.period || 'P1';
        if (!acc[p]) acc[p] = [];
        acc[p].push(event);
        return acc;
    }, {} as Record<string, GameEvent[]>);

    const periodOrder = ['P1', 'P2', 'P3', 'OT', 'PT'];
    const periodLabels: Record<string, string> = {
        P1: '1ère Période',
        P2: '2ème Période',
        P3: '3ème Période',
        OT: 'Prolongations',
        PT: 'Tirs au but',
    };

    const sortedPeriods = Object.keys(grouped).sort(
        (a, b) => periodOrder.indexOf(a) - periodOrder.indexOf(b)
    );

    return (
        <View style={styles.container}>
            {sortedPeriods.map((period, pIndex) => (
                <View key={period} style={styles.periodBlock}>
                    <Animated.View
                        entering={FadeInDown.delay(pIndex * 100)}
                        style={styles.periodHeader}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                            style={styles.periodBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Typo variant="caption" weight="black" color={Colors.white} style={{ letterSpacing: 1.5 }}>
                                {periodLabels[period] || period}
                            </Typo>
                        </LinearGradient>
                        <View style={styles.headerLine} />
                    </Animated.View>

                    <View style={styles.eventsList}>
                        {grouped[period]
                            .sort((a, b) => a.minute.localeCompare(b.minute))
                            .map((event, index) => {
                                const isGoal = event.event_type === 'goal';
                                const isHome = event.team_api_id === homeTeamApiId;

                                return (
                                    <Animated.View
                                        key={event.id || `${period}-${index}`}
                                        entering={isHome ? FadeInLeft.delay(index * 50) : FadeInRight.delay(index * 50)}
                                        style={[
                                            styles.eventRow,
                                            isHome ? styles.eventHome : styles.eventAway,
                                        ]}
                                    >
                                        {/* Content Area */}
                                        <View style={[styles.eventContent, isHome ? styles.contentHome : styles.contentAway]}>
                                            <BlurView intensity={10} tint="dark" style={styles.eventBlur}>
                                                <EventDetail
                                                    event={event}
                                                    isGoal={isGoal}
                                                    align={isHome ? 'right' : 'left'}
                                                />
                                            </BlurView>
                                        </View>

                                        {/* Center Timeline Pillar */}
                                        <View style={styles.timelineCenter}>
                                            <View style={styles.pillarLine} />
                                            <View style={[
                                                styles.iconOuter,
                                                { borderColor: isGoal ? Colors.france.blue : Colors.gold }
                                            ]}>
                                                {isGoal ? (
                                                    <Target size={14} color={Colors.white} />
                                                ) : (
                                                    <AlertTriangle size={14} color={Colors.white} />
                                                )}
                                            </View>
                                            <View style={styles.minuteBadge}>
                                                <Typo variant="caption" weight="bold" color="rgba(255,255,255,0.6)">{event.minute}'</Typo>
                                            </View>
                                        </View>

                                        {/* Spacer to keep center alignment */}
                                        <View style={styles.eventContent} />
                                    </Animated.View>
                                );
                            })}
                    </View>
                </View>
            ))}
        </View>
    );
}

function EventDetail({ event, isGoal, align }: {
    event: GameEvent;
    isGoal: boolean;
    align: 'left' | 'right';
}) {
    return (
        <View style={[styles.eventDetail, { alignItems: align === 'right' ? 'flex-end' : 'flex-start' }]}>
            <View style={styles.eventHeader}>
                <Typo variant="h4" weight="bold" color={Colors.white}>
                    {event.player_name || 'Joueur'}
                </Typo>
            </View>

            {isGoal && event.assists && event.assists.length > 0 && (
                <Typo variant="caption" color="rgba(255,255,255,0.5)" style={styles.auxText}>
                    Assists: {event.assists.join(', ')}
                </Typo>
            )}

            {!isGoal && event.comment && (
                <Typo variant="caption" color={Colors.gold} style={styles.auxText}>
                    {event.comment}
                </Typo>
            )}

            <View style={styles.teamTag}>
                <Typo variant="caption" weight="black" color="rgba(255,255,255,0.3)">
                    {event.team_name?.toUpperCase()}
                </Typo>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    periodBlock: {
        marginBottom: 32,
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    periodBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 2,
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginLeft: 16,
    },
    eventsList: {
        gap: 0,
    },
    eventRow: {
        flexDirection: 'row',
        minHeight: 80,
    },
    eventHome: {
        flexDirection: 'row',
    },
    eventAway: {
        flexDirection: 'row-reverse',
    },
    eventContent: {
        flex: 1,
        justifyContent: 'center',
    },
    contentHome: {
        paddingRight: 12,
    },
    contentAway: {
        paddingLeft: 12,
    },
    eventBlur: {
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    timelineCenter: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillarLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    iconOuter: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.night,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    minuteBadge: {
        marginTop: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    eventDetail: {
        gap: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    auxText: {
        fontStyle: 'italic',
        fontSize: 11,
    },
    teamTag: {
        marginTop: 4,
    }
});
