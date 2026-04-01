import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function RosterSection({ title, players, color }: { title: string, players: any[], color: string }) {
    if (players.length === 0) return null;

    return (
        <View style={{ marginBottom: 20 }}>
            <Typo variant="caption" weight="black" color={Colors.textSecondary} style={{ marginBottom: 10, letterSpacing: 1 }}>
                {title.toUpperCase()}
            </Typo>
            <View style={styles.rosterGrid}>
                {players.map((player) => (
                    <TouchableOpacity key={player.id} style={styles.playerCard} activeOpacity={0.7}>
                        <View style={styles.playerAvatarContainer}>
                            {player.photo_url ? (
                                <Image source={{ uri: player.photo_url }} style={styles.playerPhoto} />
                            ) : (
                                <View style={[styles.playerAvatarPlaceholder, { backgroundColor: color + '10' }]}>
                                    <Users size={20} color={color} />
                                </View>
                            )}
                            {/* Availability Icon */}
                            <View style={[styles.statusDot, { backgroundColor: player.status === 'injured' ? Colors.france.red : '#4CD964' }]} />

                            <View style={[styles.numberBadge, { backgroundColor: color }]}>
                                <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 10 }}>
                                    {player.jersey_number || '??'}
                                </Typo>
                            </View>
                        </View>
                        <Typo weight="bold" color={Colors.night} numberOfLines={1} style={{ fontSize: 13 }}>
                            {player.name.split(' ').pop()}
                        </Typo>
                        <Typo variant="caption" color={Colors.textSecondary} style={{ fontSize: 10 }}>
                            {player.goals} G • {player.assists} A
                        </Typo>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rosterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    playerCard: {
        width: (width - 72) / 3,
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 4,
    },
    playerAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 4,
        position: 'relative',
    },
    playerAvatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    numberBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    statusDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.white,
        zIndex: 2,
    },
});
