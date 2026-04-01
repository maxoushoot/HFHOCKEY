import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');
const NUM_CONFETTI = 50;
const COLORS = [Colors.france.blue, Colors.france.white, Colors.france.red, Colors.gold];

interface ConfettiPieceProps {
    startPos: { x: number, y: number };
    index: number;
    onComplete: () => void;
}

const ConfettiPiece = ({ startPos, index, onComplete }: ConfettiPieceProps) => {
    // Randomize physics
    const randomAngle = Math.random() * Math.PI * 2; // Full circle
    const randomDistance = Math.random() * 200 + 100; // 100-300px burst
    const randomDuration = Math.random() * 1000 + 1000; // 1-2s fall
    const randomRotation = Math.random() * 720 - 360;
    const randomScale = Math.random() * 0.8 + 0.4;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const translateX = useSharedValue(startPos.x);
    const translateY = useSharedValue(startPos.y);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` },
            { scale: scale.value }
        ],
        opacity: opacity.value,
        backgroundColor: color,
    }));

    useEffect(() => {
        // Initial Burst
        scale.value = withTiming(randomScale, { duration: 200 });

        const targetX = startPos.x + Math.cos(randomAngle) * randomDistance;
        const targetY = startPos.y + Math.sin(randomAngle) * randomDistance;

        // X movement (linear burst + drift)
        translateX.value = withTiming(targetX, {
            duration: randomDuration * 0.4,
            easing: Easing.out(Easing.quad)
        }, () => {
            // Slight drift after burst
            const drift = (Math.random() - 0.5) * 50;
            translateX.value = withTiming(targetX + drift, { duration: randomDuration * 0.6 });
        });

        // Y movement (burst up/down + gravity)
        translateY.value = withSequence(
            withTiming(targetY, { duration: randomDuration * 0.4, easing: Easing.out(Easing.quad) }),
            withTiming(height + 100, { duration: randomDuration * 0.6, easing: Easing.in(Easing.quad) }, () => {
                runOnJS(onComplete)();
            })
        );

        // Rotation
        rotation.value = withTiming(randomRotation, { duration: randomDuration });

        // Fade out
        opacity.value = withDelay(randomDuration * 0.7, withTiming(0, { duration: randomDuration * 0.3 }));

    }, []);

    return <Animated.View style={[styles.piece, animatedStyle]} />;
};

export interface ConfettiRef {
    explode: () => void;
}

export const ConfettiSystem = forwardRef<ConfettiRef, {}>((props, ref) => {
    const [bursts, setBursts] = useState<number[]>([]);

    useImperativeHandle(ref, () => ({
        explode: () => {
            setBursts(prev => [...prev, Date.now()]);
        }
    }));

    const removeBurst = (id: number) => {
        setBursts(prev => prev.filter(b => b !== id));
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {bursts.map(burstId => (
                <ConfettiBurst key={burstId} id={burstId} onComplete={() => removeBurst(burstId)} />
            ))}
        </View>
    );
});

const ConfettiBurst = ({ id, onComplete }: { id: number, onComplete: () => void }) => {
    const [completedCount, setCompletedCount] = useState(0);

    const handlePieceComplete = () => {
        setCompletedCount(prev => {
            const newCount = prev + 1;
            if (newCount >= NUM_CONFETTI) {
                // Defer removal slightly to be safe
                setTimeout(onComplete, 0);
            }
            return newCount;
        });
    };

    return (
        <View style={StyleSheet.absoluteFill}>
            {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
                <ConfettiPiece
                    key={i}
                    index={i}
                    startPos={{ x: width / 2, y: height / 2 }} // Center Start
                    onComplete={handlePieceComplete}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    piece: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
