import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { LiquidContainer } from '../components/ui/LiquidContainer';
import { TactileButton } from '../components/ui/TactileButton';
import { Typo } from '../components/ui/Typography';
import { Colors } from '../constants/Colors';
import { ChevronRight, Trophy, BarChart3, Gift } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/**
 * Écran de Bienvenue - Thème clair avec logo HF.
 */
export default function WelcomeScreen() {
    const handleStart = () => {
        router.push('/(auth)/signup');
    };

    return (
        <LiquidContainer>
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Image
                        source={require('../assets/images/logo-hf.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.tagline}>
                        <Typo variant="h1" weight="black" color={Colors.night}>
                            Hockey Fan
                        </Typo>
                        <Typo variant="body" color={Colors.textSecondary} style={styles.subtitle}>
                            L'application officielle des supporters{'\n'}de hockey français
                        </Typo>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <FeatureItem
                        icon={Trophy}
                        title="Matchs en direct"
                        desc="Suivez tous les matchs"
                    />
                    <FeatureItem
                        icon={BarChart3}
                        title="Stats & classements"
                        desc="Analyses et données"
                    />
                    <FeatureItem
                        icon={Gift}
                        title="Récompenses"
                        desc="Gagnez des badges"
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TactileButton onPress={handleStart} style={styles.startBtn}>
                        <Typo weight="black" color={Colors.white}>COMMENCER L'AVENTURE</Typo>
                        <ChevronRight size={20} color={Colors.white} />
                    </TactileButton>

                    <TactileButton
                        onPress={() => router.push('/(auth)/login')}
                        style={styles.loginBtn}
                    >
                        <Typo weight="bold" color={Colors.night}>
                            Déjà un compte ? Se connecter
                        </Typo>
                    </TactileButton>
                </View>
            </View>
        </LiquidContainer>
    );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Icon size={22} color={Colors.france.blue} />
            </View>
            <View style={styles.featureText}>
                <Typo variant="body" weight="bold" color={Colors.night}>{title}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>{desc}</Typo>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
        justifyContent: 'space-between',
    },
    logoSection: {
        alignItems: 'center',
        gap: 24,
    },
    logo: {
        width: width * 0.5,
        height: width * 0.3,
    },
    tagline: {
        alignItems: 'center',
        gap: 8,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
    },
    features: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        gap: 2,
    },
    footer: {
        gap: 12,
        marginBottom: 20,
    },
    startBtn: {
        backgroundColor: Colors.night,
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: Colors.night,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    loginBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: Colors.slate,
        borderRadius: 16,
    },
});
