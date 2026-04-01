import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { UserBet } from '../../types/database.types';
import { useTheme } from '../../context/ThemeContext';
import { Ticket, Search, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';

export function BettingHistoryList() {
    const { profile } = useStore(useShallow(state => ({
  profile: state.profile
})));
    const { card, text, subText, colorMode } = useTheme();
    const [bets, setBets] = useState<UserBet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            fetchBets();
        }
    }, [profile?.id]);

    const fetchBets = async () => {
        try {
            const { data, error } = await supabase
                .from('user_bets')
                .select('*')
                .eq('user_id', profile?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBets(data || []);
        } catch (err) {
            console.error('Error fetching bets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStatusIcon = (status: string) => {
        switch (status) {
            case 'won': return <CheckCircle size={20} color={Colors.france.blue} />;
            case 'lost': return <XCircle size={20} color={Colors.france.red} />;
            default: return <Clock size={20} color={Colors.gold} />; // Pending
        }
    };

    const renderItem = ({ item }: { item: UserBet }) => (
        <View style={[styles.card, { backgroundColor: card }]}>
            <View style={styles.cardHeader}>
                <View style={styles.matchInfo}>
                    <Ticket size={16} color={subText} />
                    <Typo variant="caption" weight="bold" color={subText}>
                        Match ID: {item.match_id.substring(0, 8)}...
                    </Typo>
                </View>
                <View style={[styles.statusBadge,
                item.status === 'won' && { backgroundColor: Colors.france.blue + '15' },
                item.status === 'lost' && { backgroundColor: Colors.france.red + '15' },
                item.status === 'pending' && { backgroundColor: Colors.gold + '15' }
                ]}>
                    {renderStatusIcon(item.status)}
                    <Typo variant="caption" weight="black" color={
                        item.status === 'won' ? Colors.france.blue :
                            item.status === 'lost' ? Colors.france.red :
                                Colors.gold
                    }>
                        {item.status.toUpperCase()}
                    </Typo>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View>
                    <Typo variant="h3" weight="black" color={text}>{item.amount} PTS</Typo>
                    <Typo variant="caption" color={subText}>Mise</Typo>
                </View>
                <View>
                    <Typo variant="h3" weight="black" color={text}>x{item.odds}</Typo>
                    <Typo variant="caption" color={subText}>Cote</Typo>
                </View>
                <View>
                    <Typo variant="h3" weight="black" color={item.status === 'lost' ? subText : Colors.france.blue}>
                        {item.potential_gain} PTS
                    </Typo>
                    <Typo variant="caption" color={subText}>Gain Potentiel</Typo>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <Typo>Chargement des paris...</Typo>
            </View>
        );
    }

    if (bets.length === 0) {
        return (
            <View style={styles.center}>
                <Search size={48} color={Colors.slate} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Typo variant="h3" color={text}>Aucun pari pour le moment</Typo>
                <Typo variant="body" color={subText} style={{ textAlign: 'center', marginTop: 8 }}>
                    Rendez-vous sur les matchs pour placer vos premiers paris !
                </Typo>
            </View>
        );
    }

    return (
        <FlatList
            data={bets}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
        gap: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
});
