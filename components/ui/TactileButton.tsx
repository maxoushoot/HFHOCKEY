import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TactileButtonProps {
    onPress?: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    accessibilityRole?: 'button' | 'link' | 'none';
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Bouton Tactile (TactileButton).
 * 
 * Un bouton interactif haut de gamme qui "répond" physiquement à l'utilisateur.
 * Fonctionnalités clés :
 * 1. Animation : Rétrécit légèrement au toucher (effet de pression).
 * 2. Haptique : Vibre légèrement (tap-tap) au toucher pour confirmer l'action.
 * 3. Accessibilité : Compatible avec les lecteurs d'écran.
 * 
 * @param {function} onPress - La fonction à appeler quand on clique.
 * @param {ReactNode} children - Le contenu du bouton (Texte, Icône...)
 */
export const TactileButton = React.forwardRef<View, TactileButtonProps>(({ onPress, children, style, accessibilityLabel, accessibilityRole = 'button', disabled = false }, ref) => {
    // Variable partagée pour l'animation (Échelle/Taille)
    // 1 = Taille normale (100%)
    const scale = useSharedValue(1);

    // Style animé qui se met à jour quand 'scale' change
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // Quand on appuie (Le doigt touche l'écran)
    const handlePressIn = () => {
        if (disabled) return;
        // Retour haptique (Vibration légère)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // On réduit la taille à 95% avec un effet ressort (Spring)
        scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
    };

    // Quand on relâche (Le doigt quitte l'écran)
    const handlePressOut = () => {
        if (disabled) return;
        // On revient à la taille normale (100%)
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const handlePress = () => {
        if (disabled) return;
        onPress?.();
    };

    return (
        <AnimatedPressable
            ref={ref}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, style, animatedStyle, disabled && { opacity: 0.5 }]}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ disabled }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Agrandit la zone cliquable sans changer le visuel
        >
            {children}
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    container: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
