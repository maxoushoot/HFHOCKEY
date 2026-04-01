import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors, Layout } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

interface PlayerScorer {
    id: string;
    name: string;
    team: {
        name: string;
        color: string;
        city: string;
    };
    goals: number;
    assists: number;
    points: number;
}

export const PlayersStandings = () => {
    const [scorers, setScorers] = useState<PlayerScorer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopScorers();
    }, []);

    const fetchTopScorers = async () => {
        try {
            // Fetch players with high goals/assists. 
            // Note: Supabase doesn't support computed columns in sorting easily without a view or function.
            // We'll fetch top 20 by goals and then sort client side by points for now.
            const { data, error } = await supabase
                .from('players')
                .select(`
                    id, name, goals, assists,
                    team:team_id (name, color, city)
                `)
                .order('goals', { ascending: false })
                .limit(20);

            if (error) throw error;

            const computed = (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                team: p.team,
                goals: p.goals,
                assists: p.assists,
                points: p.goals + p.assists
            })).sort((a, b) => b.points - a.points).slice(0, 5);

            setScorers(computed);
        } catch (err) {
            console.error('Error fetching scorers:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Typo variant="caption" color={Colors.textSecondary} style={{ width: 30 }}>#</Typo>
                <Typo variant="caption" color={Colors.textSecondary} style={{ flex: 1 }}>JOUEUR</Typo>
                <Typo variant="caption" color={Colors.textSecondary} style={{ width: 35, textAlign: 'center' }}>B</Typo>
                <Typo variant="caption" color={Colors.textSecondary} style={{ width: 35, textAlign: 'center' }}>A</Typo>
                <Typo variant="caption" weight="black" color={Colors.white} style={{ width: 35, textAlign: 'center' }}>PTS</Typo>
            </View>

            {/* List */}
            {scorers.map((player, index) => (
                <View key={player.id} style={styles.row}>
                    <Typo variant="h3" weight="black" color={Colors.white} style={{ width: 30, opacity: 0.5 }}>{index + 1}</Typo>

                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.avatar, { backgroundColor: player.team?.color || Colors.slate }]}>
                            <Typo variant="caption" weight="black" color={Colors.white}>
                                {player.team?.name?.charAt(0) || '?'}
                            </Typo>
                        </View>
                        <View>
                            <Typo variant="body" weight="bold" color={Colors.white}>{player.name}</Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>{player.team?.city?.toUpperCase()}</Typo>
                        </View>
                    </View>

                    <Typo variant="body" color={Colors.textSecondary} style={{ width: 35, textAlign: 'center' }}>{player.goals}</Typo>
                    <Typo variant="body" color={Colors.textSecondary} style={{ width: 35, textAlign: 'center' }}>{player.assists}</Typo>
                    <Typo variant="h3" weight="black" color={Colors.electricBlue} style={{ width: 35, textAlign: 'center' }}>{player.points}</Typo>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Layout.radius['2xl'],
        backgroundColor: '#FFFFFF',
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        paddingBottom: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.slate
    }
});
