import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { generateLineups } from '../../utils/mockMatchData';
import { useRouter } from 'expo-router';

interface MatchLineupsProps {
    match: any;
}

export function MatchLineups({ match }: MatchLineupsProps) {
    const router = useRouter();
    const [activeTeamId, setActiveTeamId] = useState(match.home_team.id);

    const activeTeam = activeTeamId === match.home_team.id ? match.home_team : match.away_team;

    const players = useMemo(() => {
        return generateLineups(activeTeamId);
    }, [activeTeamId]);

    const goalies = players.filter(p => p.position === 'G');
    const skaters = players.filter(p => p.position !== 'G');

    return (
        <View style={styles.container}>
            {/* Team Switcher */}
            <View style={styles.teamSwitcher}>
                <TouchableOpacity
                    style={[styles.teamTab, activeTeamId === match.home_team.id && styles.activeTab]}
                    onPress={() => setActiveTeamId(match.home_team.id)}
                >
                    <Typo
                        variant="body"
                        weight="bold"
                        color={activeTeamId === match.home_team.id ? Colors.night : Colors.textSecondary}
                    >
                        {match.home_team.name}
                    </Typo>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.teamTab, activeTeamId === match.away_team.id && styles.activeTab]}
                    onPress={() => setActiveTeamId(match.away_team.id)}
                >
                    <Typo
                        variant="body"
                        weight="bold"
                        color={activeTeamId === match.away_team.id ? Colors.night : Colors.textSecondary}
                    >
                        {match.away_team.name}
                    </Typo>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.teamActionBtn}
                onPress={() => {
                    if (activeTeam.slug) router.push(`/team/${activeTeam.slug}`);
                }}
            >
                <Typo variant="caption" weight="black" color={Colors.france.blue}>VOIR LA FICHE ÉQUIPE</Typo>
            </TouchableOpacity>

            <View style={styles.rosterContainer}>
                {/* Goalies */}
                <Typo variant="body" weight="bold" color={Colors.textSecondary} style={styles.sectionTitle}>GARDIENS</Typo>
                {goalies.map((player) => (
                    <PlayerRow key={player.id} player={player} />
                ))}

                {/* Skaters */}
                <Typo variant="body" weight="bold" color={Colors.textSecondary} style={styles.sectionTitle}>JOUEURS</Typo>
                {skaters.map((player) => (
                    <PlayerRow key={player.id} player={player} />
                ))}
            </View>
        </View>
    );
}

function PlayerRow({ player }: { player: any }) {
    return (
        <View style={styles.playerRow}>
            <View style={styles.numberContainer}>
                <Typo variant="body" weight="bold" color={Colors.night}>{player.number}</Typo>
            </View>
            <View style={styles.info}>
                <Typo variant="body" weight="bold" color={Colors.night}>{player.name}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>{player.position}</Typo>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    teamSwitcher: {
        flexDirection: 'row',
        backgroundColor: Colors.snowSecondary,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    teamTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },
    activeTab: {
        backgroundColor: Colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    teamActionBtn: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: Colors.france.blue + '10',
        marginBottom: 16,
    },
    rosterContainer: {
        gap: 12,
        paddingBottom: 40,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        marginTop: 12,
        marginBottom: 8,
        letterSpacing: 1,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate,
        gap: 16,
    },
    numberContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.snowSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    info: {
        flex: 1,
        gap: 2,
    }
});
