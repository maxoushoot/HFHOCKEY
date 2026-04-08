
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Trophy, Minus, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import { Team } from '../../types/database.types';
import { Bounceable } from '../ui/Bounceable';
import { useConfetti } from '../../app/_layout';
import * as Haptics from 'expo-haptics';
import { ModalBase } from '../ui/ModalBase';

interface PredictionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (homeScore: number, awayScore: number) => void;
    homeTeam?: Team;
    awayTeam?: Team;
}

export function PredictionModal({ visible, onClose, onSubmit, homeTeam, awayTeam }: PredictionModalProps) {
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const { explode } = useConfetti();

    const increment = (setter: React.Dispatch<React.SetStateAction<number>>) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(prev => Math.min(prev + 1, 15));
    };

    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        explode();
        onSubmit(homeScore, awayScore);
        onClose();
    };

    return (
        <ModalBase visible={visible} onClose={onClose} title="MON PRONO" blur>
            <Typo variant="body" color={Colors.textSecondary} style={styles.description}>
                Devinez le score exact du match !
            </Typo>

            <View style={styles.matchup}>
                <View style={styles.teamColumn}>
                    <Typo variant="h1" weight="black" color={Colors.night}>{homeTeam?.slug || 'DOM'}</Typo>
                    <View style={styles.counter}>
                        <Bounceable style={styles.counterBtn} onPress={() => decrement(setHomeScore)}>
                            <Minus size={16} color={Colors.night} />
                        </Bounceable>
                        <View style={styles.scoreDisplay}>
                            <Typo variant="h1" weight="black" color={Colors.night}>{homeScore}</Typo>
                        </View>
                        <Bounceable style={styles.counterBtn} onPress={() => increment(setHomeScore)}>
                            <Plus size={16} color={Colors.night} />
                        </Bounceable>
                    </View>
                </View>

                <Typo variant="h2" color={Colors.textSecondary} weight="black">-</Typo>

                <View style={styles.teamColumn}>
                    <Typo variant="h1" weight="black" color={Colors.night}>{awayTeam?.slug || 'EXT'}</Typo>
                    <View style={styles.counter}>
                        <Bounceable style={styles.counterBtn} onPress={() => decrement(setAwayScore)}>
                            <Minus size={16} color={Colors.night} />
                        </Bounceable>
                        <View style={styles.scoreDisplay}>
                            <Typo variant="h1" weight="black" color={Colors.night}>{awayScore}</Typo>
                        </View>
                        <Bounceable style={styles.counterBtn} onPress={() => increment(setAwayScore)}>
                            <Plus size={16} color={Colors.night} />
                        </Bounceable>
                    </View>
                </View>
            </View>

            <Bounceable style={styles.submitBtn} onPress={handleSubmit}>
                <View style={styles.submitRow}>
                    <Trophy size={16} color={Colors.white} />
                    <Typo variant="h4" weight="bold" color={Colors.white}>VALIDER MON PRONO</Typo>
                </View>
            </Bounceable>
        </ModalBase>
    );
}

const styles = StyleSheet.create({
    description: {
        textAlign: 'center',
        marginBottom: 20,
    },
    matchup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
    },
    teamColumn: {
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    counterBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreDisplay: {
        width: 40,
        alignItems: 'center',
    },
    submitBtn: {
        backgroundColor: Colors.night,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
