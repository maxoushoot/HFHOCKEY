import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { Award, Lock, Star } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface TrophyData {
    id: string;
    name: string;
    icon: string;
    description?: string;
    condition_description?: string;
    unlocked?: boolean;
}

const TrophyCard = React.memo(({ trophy, compact = false }: { trophy: TrophyData, compact?: boolean }) => {
    // @ts-ignore
    const Icon = (LucideIcons as any)[trophy.icon] || Award;
    const isUnlocked = trophy.unlocked;

    if (isUnlocked) {
        return (
            <View style={[styles.card, compact && styles.cardCompact]}>
                <LinearGradient
                    colors={['#FFFBEB', '#ffffff']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Icon size={compact ? 20 : 24} color="#D97706" />
                    <View style={styles.checkBadge}>
                        <Star size={8} color={Colors.white} fill={Colors.white} />
                    </View>
                </View>
                <View style={{ alignItems: 'center', marginTop: 8, paddingHorizontal: 4 }}>
                    <Typo variant={compact ? "caption" : "body"} weight="bold" color="#92400E" numberOfLines={1} style={{ fontSize: compact ? 11 : 13 }}>
                        {trophy.name}
                    </Typo>
                    {!compact && (
                        <Typo variant="caption" style={{ fontSize: 10, marginTop: 2, textAlign: 'center' }} color="#B45309" numberOfLines={2}>
                            {trophy.condition_description || trophy.description}
                        </Typo>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.card, styles.lockedCard, compact && styles.cardCompact]}>
            <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
                <Lock size={compact ? 18 : 20} color={Colors.textSecondary} />
            </View>
            <View style={{ alignItems: 'center', marginTop: 8, paddingHorizontal: 4 }}>
                <Typo variant={compact ? "caption" : "body"} weight="bold" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: compact ? 11 : 13, opacity: 0.7 }}>
                    {trophy.name}
                </Typo>
                {!compact && (
                    <Typo variant="caption" style={{ fontSize: 10, marginTop: 2, textAlign: 'center' }} color={Colors.textSecondary} numberOfLines={2}>
                        Locked
                    </Typo>
                )}
            </View>
        </View>
    );
});

interface TrophiesListProps {
    horizontal?: boolean;
    achievements?: TrophyData[];
    variant?: 'list' | 'grid';
}

export const TrophiesList = ({ horizontal = true, achievements, variant = 'list' }: TrophiesListProps) => {
    const [trophies, setTrophies] = useState<TrophyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!achievements) {
            fetchData();
        } else {
            setTrophies(achievements);
            setLoading(false);
        }
    }, [achievements]);

    const fetchData = async () => {
        try {
            const { data: allTrophies, error: trophiesError } = await supabase
                .from('trophies')
                .select('*')
                .order('created_at');

            if (trophiesError) throw trophiesError;

            const { data: { user } } = await supabase.auth.getUser();
            let unlockedIds: string[] = [];

            if (user) {
                const { data: userTrophies, error: userTrophiesError } = await supabase
                    .from('user_trophies')
                    .select('trophy_id')
                    .eq('user_id', user.id);

                if (!userTrophiesError && userTrophies) {
                    unlockedIds = userTrophies.map(ut => ut.trophy_id);
                }
            }

            const merged = (allTrophies || []).map(t => ({
                ...t,
                unlocked: unlockedIds.includes(t.id)
            }));

            setTrophies(merged);
        } catch (error) {
            console.error('Error fetching trophies:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = useCallback(({ item }: { item: TrophyData }) => (
        <View style={{ marginRight: horizontal ? 12 : 0, marginBottom: !horizontal ? 12 : 0, flex: variant === 'grid' ? 1 / 2 : undefined }}>
            <TrophyCard trophy={item} compact={variant === 'grid'} />
        </View>
    ), [horizontal, variant]);

    if (loading) return null; // Or skeleton

    if (variant === 'grid') {
        return (
            <View style={styles.gridContainer}>
                {trophies.map(t => (
                    <View key={t.id} style={styles.gridItem}>
                        <TrophyCard trophy={t} />
                    </View>
                ))}
            </View>
        );
    }

    return (
        <FlatList
            data={trophies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal={horizontal}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingRight: 24,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 20,
    },
    gridItem: {
        width: '48%',
    },
    card: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        width: 130,
        height: 150,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardCompact: {
        width: '100%',
        height: 120,
        padding: 12,
    },
    lockedCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#F1F5F9',
        shadowOpacity: 0,
        elevation: 0,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#D97706',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.white,
    }
});
