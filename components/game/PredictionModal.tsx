
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Trophy, Minus, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import { Team } from '../../types/database.types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { Bounceable } from '../ui/Bounceable';
import { useConfetti } from '../../app/_layout';
import * as Haptics from 'expo-haptics';

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

    // ...

    const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(prev => Math.min(prev + 1, 15));
    };

    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
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
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                {/* Click outside to close */}
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Trophy size={20} color={Colors.gold} fill={Colors.gold} />
                        </View>
                        <Typo variant="h3" weight="black" color={Colors.night}>MON PRONO</Typo>
                        <Bounceable onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color={Colors.textSecondary} />
                        </Bounceable>
                    </View>

                    <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginBottom: 20 }}>
                        Devinez le score exact du match !
                    </Typo>

                    <View style={styles.matchup}>
                        {/* HOME TEAM */}
                        <View style={styles.teamColumn}>
                            <Typo variant="h1" weight="black" color={Colors.night}>{homeTeam?.slug || 'DOM'}</Typo>
                            <View style={styles.counter}>
                                <Bounceable style={styles.counterBtn} onPress={() => decrement(setHomeScore, homeScore)}>
                                    <Minus size={16} color={Colors.night} />
                                </Bounceable>
                                <View style={styles.scoreDisplay}>
                                    <Typo variant="h1" weight="black" color={Colors.night}>{homeScore}</Typo>
                                </View>
                                <Bounceable style={styles.counterBtn} onPress={() => increment(setHomeScore, homeScore)}>
                                    <Plus size={16} color={Colors.night} />
                                </Bounceable>
                            </View>
                        </View>

                        <Typo variant="h2" color={Colors.textSecondary} weight="black">-</Typo>

                        {/* AWAY TEAM */}
                        <View style={styles.teamColumn}>
                            <Typo variant="h1" weight="black" color={Colors.night}>{awayTeam?.slug || 'EXT'}</Typo>
                            <View style={styles.counter}>
                                <Bounceable style={styles.counterBtn} onPress={() => decrement(setAwayScore, awayScore)}>
                                    <Minus size={16} color={Colors.night} />
                                </Bounceable>
                                <View style={styles.scoreDisplay}>
                                    <Typo variant="h1" weight="black" color={Colors.night}>{awayScore}</Typo>
                                </View>
                                <Bounceable style={styles.counterBtn} onPress={() => increment(setAwayScore, awayScore)}>
                                    <Plus size={16} color={Colors.night} />
                                </Bounceable>
                            </View>
                        </View>
                    </View>

                    <Bounceable style={styles.submitBtn} onPress={handleSubmit}>
                        <Typo variant="h4" weight="bold" color={Colors.white}>VALIDER MON PRONO</Typo>
                    </Bounceable>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(202, 138, 4, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
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
});
