import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Typo } from '../ui/Typography';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
    withSequence
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Flame, Shield, AlertTriangle, Gem, Activity, Crown, Rocket, Heart, PartyPopper } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';

const REACTIONS = [
    { id: 'fire', icon: Flame, color: '#FF3B30', label: 'Chaud' },
    { id: 'shield', icon: Shield, color: '#4CD964', label: 'Solide' },
    { id: 'party', icon: PartyPopper, color: '#FF9500', label: 'Fête' },
    { id: 'heart', icon: Heart, color: '#FF2D55', label: 'Love' },
    { id: 'crown', icon: Crown, color: '#FFCC00', label: 'Royal', premium: true },
    { id: 'rocket', icon: Rocket, color: '#5856D6', label: 'Boost', premium: true }
];

const { height, width } = Dimensions.get('window');

import { useStore } from '../../store/useStore';
import { SubscriptionModal } from './SubscriptionModal';

interface LiveReactionsProps {
    matchId?: string;
}

export function LiveReactions({ matchId }: LiveReactionsProps) {
    const { profile } = useStore();
    const [showPaywall, setShowPaywall] = useState(false);
    const [floaters, setFloaters] = useState<{ id: number, reaction: typeof REACTIONS[0], x: number }[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>(
        REACTIONS.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {})
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    // Fetch reaction counts from database
    useEffect(() => {
        if (!matchId) return;

        const fetchReactions = async () => {
            const { data } = await supabase
                .from('match_reactions')
                .select('reaction_type, count')
                .eq('match_id', matchId);

            if (data) {
                const dbCounts: Record<string, number> = {};
                data.forEach((row: any) => {
                    dbCounts[row.reaction_type] = row.count;
                });
                setCounts(prev => ({ ...prev, ...dbCounts }));
            }
        };

        fetchReactions();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`reactions-${matchId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'match_reactions',
                filter: `match_id=eq.${matchId}`
            }, (payload: any) => {
                if (payload.new) {
                    setCounts(prev => ({ ...prev, [payload.new.reaction_type]: payload.new.count }));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [matchId]);

    const addFloater = useCallback(async (reaction: typeof REACTIONS[0], buttonX: number) => {
        if (reaction.premium && !profile?.is_premium) {
            setShowPaywall(true);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFloaters(prev => [...prev, { id: Date.now(), reaction, x: buttonX }]);

        // Optimistic update
        setCounts(prev => ({ ...prev, [reaction.id]: prev[reaction.id] + 1 }));
        setActiveId(reaction.id);
        setTimeout(() => setActiveId(null), 150);

        // Send to database using upsert
        if (matchId) {
            const currentCount = counts[reaction.id] + 1;
            await supabase
                .from('match_reactions')
                .upsert({
                    match_id: matchId,
                    reaction_type: reaction.id,
                    count: currentCount
                }, {
                    onConflict: 'match_id,reaction_type'
                });
        }
    }, [matchId, counts]);

    const removeFloater = useCallback((id: number) => {
        setFloaters(prev => prev.filter(f => f.id !== id));
    }, []);

    const maxCount = Math.max(...Object.values(counts), 1);
    const dominantReaction = REACTIONS.find(r => counts[r.id] === maxCount) || REACTIONS[0];
    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Activity size={20} color={dominantReaction.color} />
                    <Typo variant="h3" weight="black" color={Colors.night}>
                        AMBIANCE
                    </Typo>
                </View>
                <View style={styles.totalBadge}>
                    <Typo variant="caption" weight="bold" color={Colors.textSecondary}>
                        {totalCount.toLocaleString()} RÉACT.
                    </Typo>
                </View>
            </View>

            {/* Ambient Meter */}
            <View style={styles.meterContainer}>
                <View style={styles.meterBar}>
                    {REACTIONS.map((reaction, index) => {
                        const percentage = totalCount > 0 ? (counts[reaction.id] / totalCount) * 100 : 100 / REACTIONS.length;
                        return (
                            <Animated.View
                                key={reaction.id}
                                style={[
                                    styles.meterSegment,
                                    {
                                        width: `${percentage}%`,
                                        backgroundColor: reaction.color,
                                    }
                                ]}
                            />
                        );
                    })}
                </View>
                <View style={styles.meterLabels}>
                    <View style={styles.dominantBadge}>
                        <dominantReaction.icon size={14} color={dominantReaction.color} />
                        <Typo variant="body" weight="black" color={dominantReaction.color}>
                            {dominantReaction.label.toUpperCase()}
                        </Typo>
                    </View>
                </View>
            </View>

            {/* Flying Emojis Layer */}
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
                {floaters.map(f => (
                    <FloatingReaction
                        key={f.id}
                        reaction={f.reaction}
                        startX={f.x}
                        onComplete={() => removeFloater(f.id)}
                    />
                ))}
            </View>

            {/* Reaction Buttons */}
            <View style={styles.controls}>
                {REACTIONS.map((reaction, index) => (
                    <TouchableOpacity
                        key={reaction.id}
                        style={styles.reactionWrapper}
                        onPress={() => addFloater(reaction, (index % 3) * (width - 100) / 3 + 60)}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={[
                                styles.button,
                                activeId === reaction.id && styles.buttonActive,
                                activeId === reaction.id && { backgroundColor: reaction.color + '15' },
                                reaction.premium && !profile?.is_premium && styles.buttonLocked
                            ]}
                        >
                            <View>
                                <reaction.icon
                                    size={24}
                                    color={reaction.premium && !profile?.is_premium ? Colors.textSecondary : reaction.color}
                                    fill={activeId === reaction.id ? reaction.color : 'transparent'}
                                />
                                {reaction.premium && !profile?.is_premium && (
                                    <View style={styles.lockBadge}>
                                        <Crown size={8} color={Colors.white} fill={Colors.white} />
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                        <Typo variant="caption" weight="black" color={Colors.night} style={styles.countLabel}>
                            {counts[reaction.id] >= 1000 ? `${(counts[reaction.id] / 1000).toFixed(1)}k` : counts[reaction.id]}
                        </Typo>
                    </TouchableOpacity>
                ))}
            </View>

            <SubscriptionModal
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
            />
        </View>
    );
}

function FloatingReaction({ reaction, startX, onComplete }: { reaction: typeof REACTIONS[0], startX: number, onComplete: () => void }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0.3);
    const rotate = useSharedValue(0);
    const translateX = useSharedValue(0);

    React.useEffect(() => {
        scale.value = withSequence(
            withSpring(1.3, { damping: 8 }),
            withSpring(1)
        );
        rotate.value = withTiming((Math.random() - 0.5) * 30, { duration: 1000 });
        translateX.value = withTiming((Math.random() - 0.5) * 60, { duration: 1000 });
        translateY.value = withTiming(-height * 0.25, { duration: 1200 }, () => {
            runOnJS(onComplete)();
        });
        opacity.value = withTiming(0, { duration: 1200 });
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.floater, style, { left: startX }]}>
            <reaction.icon size={36} color={reaction.color} fill={reaction.color} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 32,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    totalBadge: {
        backgroundColor: Colors.snowSecondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    meterContainer: {
        marginBottom: 24,
        gap: 10,
    },
    meterBar: {
        height: 12,
        borderRadius: 6,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: Colors.slate,
    },
    meterSegment: {
        height: '100%',
    },
    meterLabels: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dominantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.snowSecondary,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    controls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    reactionWrapper: {
        alignItems: 'center',
        gap: 6,
        width: '30%', // Responsive 3 per row
        marginVertical: 4,
    },
    button: {
        width: 68,
        height: 68,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: Colors.snowSecondary,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    buttonActive: {
        transform: [{ scale: 1.1 }],
        backgroundColor: Colors.white,
        borderColor: Colors.france.blue,
    },
    buttonLocked: {
        opacity: 0.6,
        backgroundColor: Colors.snowSecondary,
    },
    lockBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: Colors.gold,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    countLabel: {
        marginTop: 2,
    },
    floater: {
        position: 'absolute',
        bottom: 120,
    }
});
