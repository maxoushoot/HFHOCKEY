import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { Team, Match } from '../../types/database.types';

interface TeamStats {
    team: Team;
    gp: number;
    w: number;
    l: number; // Regulation loss
    otl: number; // OT/Shootout loss
    pts: number;
    gf: number;
    ga: number;
    diff: number;
}

export function StandingsTable() {
    const [standings, setStandings] = useState<TeamStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            setLoading(true);
            const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
            if (teamsError) throw teamsError;

            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('status', 'finished');

            if (matchesError) throw matchesError;

            // Initialize stats
            const statsMap = new Map<string, TeamStats>();
            (teamsData || []).forEach((team: Team) => {
                statsMap.set(team.id, {
                    team,
                    gp: 0, w: 0, l: 0, otl: 0, pts: 0, gf: 0, ga: 0, diff: 0
                });
            });

            // Compute stats
            matchesData.forEach((match: Match) => {
                const home = statsMap.get(match.home_team_id);
                const away = statsMap.get(match.away_team_id);

                if (!home || !away) return;

                const isOT = match.overtime || match.penalties || (match.status_short && ['OT', 'AP', 'TB', 'TAB'].includes(match.status_short));
                const homeScore = match.home_score;
                const awayScore = match.away_score;

                home.gp++;
                home.gf += homeScore;
                home.ga += awayScore;
                home.diff += (homeScore - awayScore);

                away.gp++;
                away.gf += awayScore;
                away.ga += homeScore;
                away.diff += (awayScore - homeScore);

                if (homeScore > awayScore) {
                    if (isOT) {
                        home.w++; // OT Win (2pts if using 3pt system usually, specifically LMS uses 3-2-1-0)
                        home.pts += 2;
                        away.otl++;
                        away.pts += 1;
                    } else {
                        home.w++;
                        home.pts += 3;
                        away.l++;
                    }
                } else {
                    if (isOT) {
                        away.w++;
                        away.pts += 2;
                        home.otl++;
                        home.pts += 1;
                    } else {
                        away.w++;
                        away.pts += 3;
                        home.l++;
                    }
                }
            });

            // Convert to array and sort
            const sortedStandings = Array.from(statsMap.values()).sort((a, b) => {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.diff !== a.diff) return b.diff - a.diff;
                return b.w - a.w;
            });

            setStandings(sortedStandings);

        } catch (error) {
            console.error('Error calculating standings:', error);
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
            <View style={styles.row}>
                <Typo variant="caption" style={{ width: 30, opacity: 0.5 }}>#</Typo>
                <Typo variant="caption" style={{ flex: 1, opacity: 0.5 }}>ÉQUIPE</Typo>
                <Typo variant="caption" style={{ width: 35, textAlign: 'center', opacity: 0.5 }}>MJ</Typo>
                <Typo variant="caption" style={{ width: 35, textAlign: 'center', opacity: 0.5 }}>PTS</Typo>
            </View>

            {/* Rows (Optimized with FlatList for Standings Length) */}
            <View style={{ minHeight: standings.length * 45 }}>
                {standings.map((row, index) => (
                    <View key={row.team.id} style={styles.row}>
                        <Typo variant="body" weight="black" style={{ width: 30 }}>{index + 1}</Typo>
                        <Typo variant="body" weight="bold" style={{ flex: 1 }}>{row.team.name}</Typo>
                        <Typo variant="body" style={{ width: 35, textAlign: 'center', opacity: 0.8 }}>{row.gp}</Typo>
                        <Typo variant="body" weight="black" color={Colors.electricBlue} style={{ width: 35, textAlign: 'center' }}>{row.pts}</Typo>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    }
});
