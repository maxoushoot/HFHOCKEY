import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { Plus, ChevronRight, Trash2, Star } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

interface MatchItem {
    id: string;
    scheduled_at: string;
    status: string;
    home_score?: number;
    away_score?: number;
    is_featured: boolean;
    home_team?: any;
    away_team?: any;
}

export default function AdminMatchesList() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id, scheduled_at, status, home_score, away_score, is_featured,
                home_team:home_team_id(slug, name),
                away_team:away_team_id(slug, name)
            `)
            .order('scheduled_at', { ascending: false });

        if (!error && data) {
            setMatches(data);
        }
        setLoading(false);
    };

    const toggleFeatured = async (id: string, currentValue: boolean) => {
        // Optimistic update
        setMatches(prev => prev.map(m => m.id === id ? { ...m, is_featured: !currentValue } : m));

        // If turning ON, turn others OFF (optional, but good for "Featured Match" logic)
        if (!currentValue) {
            await supabase.from('matches').update({ is_featured: false }).neq('id', id);
            setMatches(prev => prev.map(m => m.id !== id ? { ...m, is_featured: false } : { ...m, is_featured: true }));
        }

        try {
            const { error } = await supabase
                .from('matches')
                .update({ is_featured: !currentValue })
                .eq('id', id);

            if (error) throw error;
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Erreur inconnue";
            Alert.alert('Erreur', msg);
            fetchMatches(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Supprimer",
            "Êtes-vous sûr ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('matches').delete().eq('id', id);
                            if (error) throw error;
                            fetchMatches();
                        } catch (error: unknown) {
                            console.error(error);
                            const msg = error instanceof Error ? error.message : "Erreur inconnue";
                            Alert.alert('Erreur', msg);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: MatchItem }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/matches/${item.id}`)}
            >
                <View style={styles.dateBadge}>
                    <Typo variant="caption" color={Colors.textSecondary}>
                        {new Date(item.scheduled_at).toLocaleDateString()}
                    </Typo>
                    <Typo variant="caption" weight="bold" color={item.status === 'live' ? Colors.alertRed : Colors.textSecondary}>
                        {item.status.toUpperCase()}
                    </Typo>
                </View>

                <View style={styles.matchRow}>
                    <View style={styles.team}>
                        <Typo variant="body" weight="bold" color={Colors.night}>{item.home_team?.name}</Typo>
                    </View>
                    <View style={styles.score}>
                        <Typo variant="h3" weight="black" color={Colors.primary}>
                            {item.home_score ?? 0} - {item.away_score ?? 0}
                        </Typo>
                    </View>
                    <View style={styles.team}>
                        <Typo variant="body" weight="bold" color={Colors.night} style={{ textAlign: 'right' }}>{item.away_team?.name}</Typo>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
                <View style={styles.switchContainer}>
                    <Star size={16} color={item.is_featured ? Colors.gold : Colors.textSecondary} fill={item.is_featured ? Colors.gold : 'transparent'} />
                    <Typo variant="caption" color={Colors.textSecondary}>À la une</Typo>
                    <Switch
                        value={item.is_featured}
                        onValueChange={() => toggleFeatured(item.id, item.is_featured)}
                        trackColor={{ false: "#E2E8F0", true: Colors.gold }}
                        thumbColor={Colors.white}
                    />
                </View>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={20} color={Colors.alertRed} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LiquidContainer style={{ paddingHorizontal: 0 }}>
            <Stack.Screen options={{
                headerTitle: "Gérer les Matchs",
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.push('/admin/matches/new')} style={{ marginRight: 16 }}>
                        <Plus color={Colors.primary} size={28} />
                    </TouchableOpacity>
                )
            }} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    list: { padding: 16, paddingTop: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dateBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 8,
    },
    matchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    team: { flex: 1 },
    score: { paddingHorizontal: 16 },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
    }
});
