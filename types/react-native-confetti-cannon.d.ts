declare module 'react-native-confetti-cannon' {
    import { Component } from 'react';
    import { ViewStyle, StyleProp } from 'react-native';

    export interface ConfettiCannonProps {
        count?: number;
        origin?: { x: number; y: number };
        explosionSpeed?: number;
        fallSpeed?: number;
        colors?: string[];
        fadeOut?: boolean;
        autoStart?: boolean;
        autoStartDelay?: number;
        onAnimationStart?: () => void;
        onAnimationEnd?: () => void;
        style?: StyleProp<ViewStyle>;
    }

    export default class ConfettiCannon extends Component<ConfettiCannonProps> {
        start(): void;
        stop(): void;
    }
}
