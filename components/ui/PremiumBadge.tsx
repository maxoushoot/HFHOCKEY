import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Typo } from './Typography';
import { Crown } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withDelay } from 'react-native-reanimated';

interface PremiumBadgeProps {
    mini?: boolean;
}

export function PremiumBadge({ mini = false }: PremiumBadgeProps) {
    const shimmerValue = useSharedValue(-100);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withDelay(2000, withTiming(100, { duration: 1500, easing: Easing.linear })),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerValue.value }],
    }));

    if (mini) {
        return (
            <View style={[styles.badgeMini, styles.shadow]}>
                <LinearGradient
                    colors={['#FDE68A', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <Crown size={12} color={Colors.white} fill={Colors.white} />
            </View>
        );
    }

    return (
        <View style={[styles.container, styles.shadow]}>
            <LinearGradient
                colors={['#FDE68A', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Shimmer Effect */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12 }]}>
                <Animated.View style={[{ width: '50%', height: '100%', opacity: 0.3 }, animatedStyle]}>
                    <LinearGradient
                        colors={['transparent', '#FFFFFF', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>

            <View style={styles.content}>
                <Crown size={14} color={Colors.white} fill={Colors.white} />
                <Typo variant="caption" weight="black" color={Colors.white} style={{ fontSize: 10 }}>
                    PREMIUM
                </Typo>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    shadow: {
        shadowColor: "#D97706",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    badgeMini: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    }
});
