import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
    const translateX = useSharedValue(-SCREEN_WIDTH);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(SCREEN_WIDTH, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View
            style={[
                styles.container,
                { width, height, borderRadius, overflow: 'hidden' } as any,
                style,
            ]}
        >
            <Animated.View style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E2E8F0', // Base color matching other UI elements
        width: '100%',
    },
});
