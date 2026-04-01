import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import { Typo } from '../ui/Typography';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ GAME CONSTANTS ============
const GAME_WIDTH = SCREEN_WIDTH;
const GAME_HEIGHT = SCREEN_HEIGHT;
const PIXEL_SIZE = 4; // Size of each "pixel" in the sprites

// Player
const PLAYER_WIDTH = 11 * PIXEL_SIZE; // 44px
const PLAYER_HEIGHT = 14 * PIXEL_SIZE; // 56px
const PLAYER_Y = GAME_HEIGHT - 120; // Fixed Y position near bottom

// Obstacles & Collectibles
const PUCK_SIZE = 6 * PIXEL_SIZE; // 24px
const ZAMBONI_WIDTH = 14 * PIXEL_SIZE; // 56px
const ZAMBONI_HEIGHT = 10 * PIXEL_SIZE; // 40px

// Speed & Physics
const INITIAL_SPEED = 3;
const MAX_SPEED = 12;
const SPEED_INCREMENT = 0.002;
const LERP_FACTOR = 0.12; // Smooth gliding interpolation
const MOVE_SPEED = 8; // Lateral movement per frame when key held

// ============ MONOCHROME PALETTE ============
const ICE = '#f7f7f7';
const INK = '#535353';
const INK_LIGHT = '#757575';

// ============ PIXEL ART MATRICES ============
// 1 = filled, 0 = empty

// Hockey Player (11x14) - viewed from behind
const PLAYER_MATRIX = [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
];

// Puck (6x3)
const PUCK_MATRIX = [
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
];

// Zamboni (14x10) - viewed from above
const ZAMBONI_MATRIX = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
];

// ============ PIXEL SPRITE RENDERER ============
const PixelSprite = ({ matrix, pixelSize = PIXEL_SIZE, color = INK }: {
    matrix: number[][],
    pixelSize?: number,
    color?: string
}) => (
    <View style={{ flexDirection: 'column' }}>
        {matrix.map((row, y) => (
            <View key={y} style={{ flexDirection: 'row' }}>
                {row.map((cell, x) => (
                    <View
                        key={x}
                        style={{
                            width: pixelSize,
                            height: pixelSize,
                            backgroundColor: cell ? color : 'transparent',
                        }}
                    />
                ))}
            </View>
        ))}
    </View>
);

// ============ MAIN COMPONENT ============
interface PuckRunnerProps {
    onScore: (score: number) => void;
    onClose?: () => void;
}

interface GameObject {
    id: number;
    x: number;
    y: number;
    type: 'puck' | 'zamboni';
}

export function PuckRunner({ onScore, onClose }: PuckRunnerProps) {
    const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [objects, setObjects] = useState<GameObject[]>([]);
    const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);

    // Refs for game loop
    const targetXRef = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    const currentXRef = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    const speedRef = useRef(INITIAL_SPEED);
    const scoreRef = useRef(0);
    const gameLoopRef = useRef<number | null>(null);
    const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMovingLeftRef = useRef(false);
    const isMovingRightRef = useRef(false);

    // ============ LERP FUNCTION ============
    const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
    };

    // ============ TOUCH CONTROLS ============
    const handleTouchStart = useCallback((side: 'left' | 'right') => {
        if (gameState === 'idle') {
            startGame();
            return;
        }
        if (gameState === 'gameover') {
            startGame();
            return;
        }
        if (side === 'left') {
            isMovingLeftRef.current = true;
        } else {
            isMovingRightRef.current = true;
        }
    }, [gameState]);

    const handleTouchEnd = useCallback((side: 'left' | 'right') => {
        if (side === 'left') {
            isMovingLeftRef.current = false;
        } else {
            isMovingRightRef.current = false;
        }
    }, []);

    // ============ GAME CONTROL ============
    const startGame = useCallback(() => {
        setObjects([]);
        setScore(0);
        scoreRef.current = 0;
        speedRef.current = INITIAL_SPEED;
        targetXRef.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
        currentXRef.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
        setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
        isMovingLeftRef.current = false;
        isMovingRightRef.current = false;
        setGameState('running');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    const gameOver = useCallback(() => {
        setGameState('gameover');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
        }

        onScore(scoreRef.current);

        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    }, [highScore, onScore]);

    // ============ GAME LOOP ============
    useEffect(() => {
        if (gameState !== 'running') return;

        const gameLoop = () => {
            // Update target position based on held controls
            if (isMovingLeftRef.current) {
                targetXRef.current = Math.max(10, targetXRef.current - MOVE_SPEED);
            }
            if (isMovingRightRef.current) {
                targetXRef.current = Math.min(GAME_WIDTH - PLAYER_WIDTH - 10, targetXRef.current + MOVE_SPEED);
            }

            // Lerp current position towards target (ice glide effect)
            currentXRef.current = lerp(currentXRef.current, targetXRef.current, LERP_FACTOR);
            setPlayerX(currentXRef.current);

            // Move objects down (player "moves up")
            setObjects(prev => {
                const updated = prev
                    .map(obj => ({ ...obj, y: obj.y + speedRef.current }))
                    .filter(obj => obj.y < GAME_HEIGHT + 50);

                // Collision detection
                const px = currentXRef.current;
                const py = PLAYER_Y;
                const pw = PLAYER_WIDTH;
                const ph = PLAYER_HEIGHT;

                for (const obj of updated) {
                    const ow = obj.type === 'zamboni' ? ZAMBONI_WIDTH : PUCK_SIZE;
                    const oh = obj.type === 'zamboni' ? ZAMBONI_HEIGHT : PUCK_SIZE;

                    // Check collision
                    if (
                        px < obj.x + ow - 8 &&
                        px + pw > obj.x + 8 &&
                        py < obj.y + oh &&
                        py + ph > obj.y
                    ) {
                        if (obj.type === 'zamboni') {
                            gameOver();
                            return [];
                        } else if (obj.type === 'puck') {
                            // Collect puck
                            scoreRef.current += 10;
                            setScore(scoreRef.current);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            return updated.filter(o => o.id !== obj.id);
                        }
                    }
                }

                return updated;
            });

            // Increase speed progressively
            speedRef.current = Math.min(MAX_SPEED, speedRef.current + SPEED_INCREMENT);

            // Continue loop
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        // Spawn objects
        const spawnObject = () => {
            if (gameState !== 'running') return;

            // More zambonis as difficulty increases
            const zamboniChance = 0.6 + (speedRef.current / MAX_SPEED) * 0.2;
            const type: 'puck' | 'zamboni' = Math.random() < zamboniChance ? 'zamboni' : 'puck';

            const objWidth = type === 'zamboni' ? ZAMBONI_WIDTH : PUCK_SIZE;
            const margin = 20;
            const x = margin + Math.random() * (GAME_WIDTH - objWidth - margin * 2);

            setObjects(prev => [...prev, {
                id: Date.now() + Math.random(),
                x,
                y: -60,
                type,
            }]);

            // Spawn faster as speed increases
            const baseInterval = 1000 - (speedRef.current * 40);
            const delay = Math.max(300, baseInterval + Math.random() * 400);
            spawnTimerRef.current = setTimeout(spawnObject, delay);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);
        spawnTimerRef.current = setTimeout(spawnObject, 500);

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        };
    }, [gameState, gameOver]);

    // ============ RENDER ============
    return (
        <View style={styles.container}>
            {/* Score HUD */}
            <View style={styles.hud}>
                <View style={styles.scoreBox}>
                    {highScore > 0 && (
                        <Typo style={styles.hiScore}>HI {String(highScore).padStart(5, '0')}</Typo>
                    )}
                    <Typo style={styles.score}>{String(score).padStart(5, '0')}</Typo>
                </View>
            </View>

            {/* Game Canvas */}
            <View style={styles.canvas}>
                {/* Ice texture (subtle dots) */}
                <View style={styles.iceTexture}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View key={i} style={[styles.iceDot, {
                            left: (i * 47) % GAME_WIDTH,
                            top: ((i * 73) + (Date.now() / 100 * speedRef.current)) % GAME_HEIGHT
                        }]} />
                    ))}
                </View>

                {/* Objects */}
                {objects.map(obj => (
                    <View
                        key={obj.id}
                        style={[styles.object, { left: obj.x, top: obj.y }]}
                    >
                        {obj.type === 'puck' ? (
                            <PixelSprite matrix={PUCK_MATRIX} />
                        ) : (
                            <PixelSprite matrix={ZAMBONI_MATRIX} />
                        )}
                    </View>
                ))}

                {/* Player */}
                <View style={[styles.player, { left: playerX }]}>
                    <PixelSprite matrix={PLAYER_MATRIX} />
                </View>
            </View>

            {/* Touch Zones (Invisible) */}
            {gameState === 'running' && (
                <View style={styles.touchZones}>
                    <TouchableWithoutFeedback
                        onPressIn={() => handleTouchStart('left')}
                        onPressOut={() => handleTouchEnd('left')}
                    >
                        <View style={styles.touchZone} />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPressIn={() => handleTouchStart('right')}
                        onPressOut={() => handleTouchEnd('right')}
                    >
                        <View style={styles.touchZone} />
                    </TouchableWithoutFeedback>
                </View>
            )}

            {/* Start Screen */}
            {gameState === 'idle' && (
                <TouchableWithoutFeedback onPress={startGame}>
                    <View style={styles.overlay}>
                        <View style={styles.logoSprite}>
                            <PixelSprite matrix={PLAYER_MATRIX} pixelSize={6} />
                        </View>
                        <Typo style={styles.title}>PUCK RUNNER</Typo>
                        <Typo style={styles.subtitle}>
                            Récupère les palets{'\n'}Évite les surfaceuses
                        </Typo>
                        <View style={styles.startPrompt}>
                            <Typo style={styles.promptText}>APPUIE POUR JOUER</Typo>
                        </View>
                        <Typo style={styles.controls}>← GAUCHE | DROITE →</Typo>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
                <TouchableWithoutFeedback onPress={startGame}>
                    <View style={styles.overlay}>
                        <Typo style={styles.gameOverTitle}>GAME OVER</Typo>

                        <View style={styles.finalScoreBox}>
                            <Typo style={styles.finalScoreLabel}>SCORE</Typo>
                            <Typo style={styles.finalScore}>{score}</Typo>
                        </View>

                        {score >= highScore && highScore > 0 && (
                            <View style={styles.newRecord}>
                                <Typo style={styles.newRecordText}>★ NOUVEAU RECORD ★</Typo>
                            </View>
                        )}

                        <View style={styles.restartPrompt}>
                            <Typo style={styles.promptText}>APPUIE POUR REJOUER</Typo>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ICE,
    },
    hud: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 100,
    },
    scoreBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    hiScore: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        color: INK_LIGHT,
        letterSpacing: 1,
    },
    score: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 20,
        fontWeight: 'bold',
        color: INK,
        letterSpacing: 2,
    },
    canvas: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    iceTexture: {
        ...StyleSheet.absoluteFillObject,
    },
    iceDot: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: INK_LIGHT,
        opacity: 0.15,
    },
    object: {
        position: 'absolute',
    },
    player: {
        position: 'absolute',
        top: PLAYER_Y,
    },
    touchZones: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    touchZone: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(247, 247, 247, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    logoSprite: {
        marginBottom: 24,
    },
    title: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 32,
        fontWeight: 'bold',
        color: INK,
        letterSpacing: 4,
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        color: INK_LIGHT,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    startPrompt: {
        borderWidth: 2,
        borderColor: INK,
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginBottom: 16,
    },
    promptText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        color: INK,
        letterSpacing: 2,
    },
    controls: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        color: INK_LIGHT,
        letterSpacing: 1,
    },
    gameOverTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 28,
        fontWeight: 'bold',
        color: INK,
        letterSpacing: 4,
        marginBottom: 24,
    },
    finalScoreBox: {
        borderWidth: 2,
        borderColor: INK,
        paddingHorizontal: 40,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    finalScoreLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        color: INK_LIGHT,
        letterSpacing: 2,
        marginBottom: 4,
    },
    finalScore: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 36,
        fontWeight: 'bold',
        color: INK,
    },
    newRecord: {
        backgroundColor: INK,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 24,
    },
    newRecordText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        fontWeight: 'bold',
        color: ICE,
        letterSpacing: 1,
    },
    restartPrompt: {
        borderWidth: 2,
        borderColor: INK,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
});
