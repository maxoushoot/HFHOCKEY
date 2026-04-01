import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BounceableProps extends TouchableOpacityProps {
    scale?: number;
    haptic?: boolean;
    hapticStyle?: Haptics.ImpactFeedbackStyle;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

/**
 * Bounceable - Un wrapper qui ajoute une animation de "ressort" (scale) 
 * et un retour haptique lors de l'interaction.
 * 
 * Usage:
 * <Bounceable onPress={...}>
 *   <View>...</View>
 * </Bounceable>
 */
export const Bounceable = ({
    scale = 0.96,
    haptic = true,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
    style,
    onPressIn,
    onPressOut,
    onPress,
    children,
    ...props
}: BounceableProps) => {
    const scaleValue = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleValue.value }],
    }));

    const handlePressIn = (e: any) => {
        scaleValue.value = withSpring(scale, { damping: 10, stiffness: 300 });
        if (haptic) {
            Haptics.impactAsync(hapticStyle);
        }
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        scaleValue.value = withSpring(1, { damping: 10, stiffness: 300 });
        onPressOut?.(e);
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={style}
            {...props}
        >
            <Animated.View style={[animatedStyle]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};
