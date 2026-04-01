import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { generateStats } from '../../utils/mockMatchData';
import { Match } from '../../types/database.types';

export interface TeamStats {
    shots: number;
    faceoffs: number;
    powerplay: string | number;
    penalties: number;
}

export interface MatchStatsData {
    home: TeamStats;
    away: TeamStats;
}

interface MatchStatsProps {
    match: Match & { 
        stats?: MatchStatsData; 
        home_team?: { color?: string }; 
        away_team?: { color?: string }; 
    };
}

export function MatchStats({ match }: MatchStatsProps) {
    const stats = useMemo(() => {
        if (!match) return null;
        if (match.stats) return match.stats;
        return generateStats(match.id);
    }, [match]);

    if (!stats) return null;

    return (
        <View style={styles.container}>
            <StatRow
                label="Tirs au but"
                homeValue={stats.home.shots}
                awayValue={stats.away.shots}
                homeColor={match.home_team?.color}
                awayColor={match.away_team?.color}
            />
            <StatRow
                label="Mises au jeu gagnées"
                homeValue={stats.home.faceoffs}
                awayValue={stats.away.faceoffs}
                homeColor={match.home_team?.color}
                awayColor={match.away_team?.color}
            />
            <StatRow
                label="Powerplay"
                homeValue={stats.home.powerplay}
                awayValue={stats.away.powerplay}
                homeColor={match.home_team?.color}
                awayColor={match.away_team?.color}
                isText
            />
            <StatRow
                label="Pénalités (min)"
                homeValue={stats.home.penalties}
                awayValue={stats.away.penalties}
                homeColor={match.home_team?.color}
                awayColor={match.away_team?.color}
            />
        </View>
    );
}

interface StatRowProps {
    label: string;
    homeValue: number | string;
    awayValue: number | string;
    homeColor?: string;
    awayColor?: string;
    isText?: boolean;
}

function StatRow({ label, homeValue, awayValue, homeColor = Colors.night, awayColor = Colors.night, isText = false }: StatRowProps) {
    const hVal = typeof homeValue === 'number' ? homeValue : 0;
    const aVal = typeof awayValue === 'number' ? awayValue : 0;
    const total = hVal + aVal;

    // Calculate percentages for bar width
    const homePercent = total > 0 ? (hVal / total) * 100 : 50;
    const awayPercent = total > 0 ? (aVal / total) * 100 : 50;

    return (
        <View style={styles.statRow}>
            <View style={styles.labels}>
                <Typo variant="h3" weight="black" color={homeColor}>{homeValue}</Typo>
                <Typo variant="caption" weight="bold" color={Colors.textSecondary} style={{ textTransform: 'uppercase' }}>{label}</Typo>
                <Typo variant="h3" weight="black" color={awayColor}>{awayValue}</Typo>
            </View>

            {!isText && (
                <View style={styles.barContainer}>
                    <View style={[styles.bar, { width: `${homePercent}%`, backgroundColor: homeColor, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                    <View style={[styles.bar, { width: `${awayPercent}%`, backgroundColor: awayColor, borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 24,
        backgroundColor: Colors.white,
        borderRadius: 24,
        paddingVertical: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statRow: {
        gap: 8,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    barContainer: {
        flexDirection: 'row',
        height: 8,
        backgroundColor: Colors.slate,
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
    }
});
