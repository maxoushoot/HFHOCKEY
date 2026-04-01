import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Crown, Trophy, User } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    avatar_url: string | null;
    total_points: number;
    is_premium: boolean;
}

export function FantasyLeaderboard() {
    const { profile } = useStore(useShallow(state => ({
  profile: state.profile
})));
    const { card, text, subText, colorMode } = useTheme();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch stats from fantasy_teams joined with user_profiles
                const { data, error } = await supabase
                    .from('fantasy_teams')
                    .select(`
                        user_id,
                        total_points,
                        user_profiles:user_id (
                            username,
                            avatar_url,
                            is_premium
                        )
                    `)
                    .order('total_points', { ascending: false })
                    .limit(50);

                if (error) throw error;

                const formatted: LeaderboardEntry[] = (data || []).map((item: any, index: number) => ({
                    rank: index + 1,
                    user_id: item.user_id,
                    username: item.user_profiles?.username || 'Anonyme',
                    avatar_url: item.user_profiles?.avatar_url,
                    total_points: item.total_points || 0,
                    is_premium: item.user_profiles?.is_premium || false,
                }));

                setLeaderboard(formatted);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const renderRankBadge = (rank: number) => {
        if (rank === 1) return <Crown size={20} color={Colors.gold} fill={Colors.gold} />;
        if (rank === 2) return <Trophy size={18} color="#C0C0C0" fill="#C0C0C0" />; // Silver
        if (rank === 3) return <Trophy size={18} color="#CD7F32" fill="#CD7F32" />;
        return <Typo variant="body" weight="black" color={subText} style={{ width: 20, textAlign: 'center' }}>{rank}</Typo>;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Trophy size={24} color={Colors.gold} />
                <Typo variant="h2" weight="black" color={text}>Classement Général</Typo>
            </View>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <Typo variant="body" color={subText} style={{ textAlign: 'center', marginTop: 20 }}>Chargement...</Typo>
                ) : (
                    leaderboard.map((item) => {
                        const isMe = item.user_id === profile?.id;
                        return (
                            <View
                                key={item.user_id}
                                style={[
                                    styles.row,
                                    { backgroundColor: card },
                                    isMe && { borderColor: Colors.france.blue, borderWidth: 1, backgroundColor: colorMode === 'dark' ? 'rgba(0, 51, 153, 0.2)' : '#EBF8FF' }
                                ]}
                            >
                                <View style={styles.rankCol}>
                                    {renderRankBadge(item.rank)}
                                </View>

                                <View style={[styles.avatar, { backgroundColor: item.is_premium ? Colors.gold : Colors.slate }]}>
                                    <Typo style={{ fontSize: 16 }}>{item.avatar_url || '👤'}</Typo>
                                </View>

                                <View style={styles.infoCol}>
                                    <Typo variant="body" weight="bold" color={text} numberOfLines={1}>
                                        {item.username}
                                    </Typo>
                                    {item.is_premium && (
                                        <Typo variant="caption" color={Colors.gold} weight="black" style={{ fontSize: 10 }}>PREMIUM</Typo>
                                    )}
                                </View>

                                <View style={styles.pointsCol}>
                                    <Typo variant="body" weight="black" color={Colors.france.blue}>
                                        {item.total_points}
                                    </Typo>
                                    <Typo variant="caption" color={subText} style={{ fontSize: 10 }}>PTS</Typo>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        justifyContent: 'center',
    },
    list: {
        paddingBottom: 40,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
    },
    rankCol: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCol: {
        flex: 1,
    },
    pointsCol: {
        alignItems: 'flex-end',
    },
});
