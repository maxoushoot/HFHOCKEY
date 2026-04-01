import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors, CardStyles } from '../../constants/Colors';
import { useTeamTheme } from '../../hooks/useTeamTheme';
import { Award, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { getLevel, getNextLevelXP } from '../../utils/game-logic';
import { useShallow } from 'zustand/react/shallow';

interface XPBarProps {
    currentXP?: number;
    level?: number;
}

export const XPBar = ({ currentXP: propXP, level: propLevel }: XPBarProps) => {
    const { primary } = useTeamTheme();
    const { profile } = useStore(useShallow(state => ({
  profile: state.profile
})));

    // Fallback if no profile
    const currentXP = propXP ?? profile?.xp ?? 0;

    // Use centralized logic
    const level = propLevel ?? getLevel(currentXP);
    const prevLevelXP = level > 1 ? getNextLevelXP(level - 1) : 0;
    const nextLevelXP = getNextLevelXP(level);

    // XP within the current bracket
    const xpInLevel = currentXP - prevLevelXP;
    const range = nextLevelXP - prevLevelXP;
    const maxXP = nextLevelXP;


    const progress = Math.min(100, Math.max(0, (xpInLevel / range) * 100));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <Zap size={16} color={primary} />
                    <Typo variant="body" weight="bold" color={Colors.night}>PROGRESSION • NIV {level}</Typo>
                </View>
                <Typo variant="body" weight="black" color={primary}>{currentXP} / {maxXP}</Typo>
            </View>

            <View style={styles.track}>
                <LinearGradient
                    colors={[primary, primary + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progress, { width: `${progress}%` }]}
                />
            </View>

            <View style={styles.reward}>
                <View style={[styles.rewardIcon, { backgroundColor: Colors.gold + '20' }]}>
                    <Award size={16} color={Colors.gold} />
                </View>
                <Typo variant="caption" color={Colors.textSecondary}>
                    Prochaine récompense : <Typo variant="caption" weight="bold" color={Colors.night}>Badge "Supporter Or"</Typo>
                </Typo>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...CardStyles.base,
        marginTop: 24,
        marginHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    track: {
        height: 14,
        backgroundColor: Colors.slate,
        borderRadius: 7,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progress: {
        height: '100%',
        borderRadius: 7,
    },
    reward: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.slate,
        padding: 12,
        borderRadius: 14,
    },
    rewardIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
