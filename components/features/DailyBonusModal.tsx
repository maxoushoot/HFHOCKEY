import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { Gift, X } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyBonusModalProps {
    visible: boolean;
    xpAmount: number;
    onClaim: () => void;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export function DailyBonusModal({ visible, xpAmount, onClaim, onClose }: DailyBonusModalProps) {
    const scale = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1);
            rotate.value = withSequence(
                withDelay(500, withSpring(10)),
                withSpring(-10),
                withSpring(0)
            );
        } else {
            scale.value = 0;
            rotate.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <LinearGradient
                        colors={[Colors.france.blue, Colors.france.blueDark]}
                        style={styles.header}
                    >
                        <Animated.View style={[styles.iconContainer, animatedStyle]}>
                            <Gift size={48} color={Colors.white} />
                        </Animated.View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <X size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.content}>
                        <Typo variant="h2" weight="black" color={Colors.night} style={{ textAlign: 'center' }}>
                            Bonus Quotidien !
                        </Typo>
                        <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                            Reviens chaque jour pour gagner de l'XP et monter en niveau.
                        </Typo>

                        <View style={styles.rewardBox}>
                            <Typo variant="h1" weight="black" color={Colors.france.blue} style={{ fontSize: 40 }}>
                                +{xpAmount}
                            </Typo>
                            <Typo variant="h3" weight="bold" color={Colors.france.blue}>XP</Typo>
                        </View>

                        <TouchableOpacity style={styles.claimBtn} onPress={onClaim}>
                            <Typo variant="h3" weight="bold" color={Colors.white}>
                                Réclamer
                            </Typo>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: width - 48,
        backgroundColor: Colors.white,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
        width: '100%',
    },
    rewardBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginVertical: 24,
        padding: 16,
        backgroundColor: Colors.france.blue + '10', // 10% opacity hex
        borderRadius: 16,
        width: '100%',
        justifyContent: 'center',
    },
    claimBtn: {
        backgroundColor: Colors.france.blue,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        shadowColor: Colors.france.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
