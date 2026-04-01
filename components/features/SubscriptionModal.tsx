import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import { Bounceable } from '../ui/Bounceable';
import { LinearGradient } from 'expo-linear-gradient';
import { useConfetti } from '../../app/_layout';
import { useStore } from '../../store/useStore';

interface SubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
    const { explode } = useConfetti();
    const { subscribeToPremium, fetchProfile, session } = useStore();
    const [loading, setLoading] = useState(false);

    const features = [
        "Statistiques avancées des joueurs",
        "Pronostics illimités",
        "Badge Premium exclusif",
        "Support prioritaire",
        "Pas de publicités (à venir)"
    ];

    const handleSubscribe = async () => {
        setLoading(true);
        // Simulation de délai réseau
        setTimeout(async () => {
            await subscribeToPremium();
            setLoading(false);
            explode();
            onClose();
        }, 1500);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.header}>
                            <LinearGradient
                                colors={['#FDE68A', '#D97706']}
                                style={styles.iconContainer}
                            >
                                <Typo variant="h1" style={{ fontSize: 40 }}>👑</Typo>
                            </LinearGradient>
                            <Typo variant="h2" weight="black" color={Colors.night} style={{ marginTop: 16 }}>
                                DEVENEZ PREMIUM
                            </Typo>
                            <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                                Débloquez tout le potentiel de l'application et soutenez le projet !
                            </Typo>
                        </View>

                        <View style={styles.featuresList}>
                            {features.map((feature, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <View style={styles.checkIcon}>
                                        <Check size={14} color={Colors.white} strokeWidth={3} />
                                    </View>
                                    <Typo variant="body" color={Colors.night} weight="medium">
                                        {feature}
                                    </Typo>
                                </View>
                            ))}
                        </View>

                        <View style={styles.pricingContainer}>
                            <Typo variant="h1" weight="black" color={Colors.night}>Simulation</Typo>
                            <Typo variant="body" color={Colors.textSecondary}>Gratuit pour les devs</Typo>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Bounceable onPress={handleSubscribe} disabled={loading} style={{ width: '100%' }}>
                            <LinearGradient
                                colors={loading ? ['#94a3b8', '#64748b'] : ['#FDE68A', '#D97706']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.subscribeBtn}
                            >
                                <Typo variant="h4" weight="black" color={Colors.white}>
                                    {loading ? 'ACTIVATION...' : 'ACTIVER LE PREMIUM'}
                                </Typo>
                            </LinearGradient>
                        </Bounceable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        paddingTop: 24,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    closeBtn: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        backgroundColor: '#F1F5F9',
        padding: 8,
        borderRadius: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#D97706",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    featuresList: {
        gap: 16,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#D97706',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pricingContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFBEB',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FEF3C7',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    subscribeBtn: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#D97706",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    }
});
