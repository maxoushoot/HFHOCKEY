import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { TactileButton } from '../ui/TactileButton';
import { Brain, Clock, Trophy, ArrowRight, RefreshCw, Book, History, Users, Shield, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';

interface QuizGameProps {
    onScore?: (score: number) => void;
}

interface Question {
    q: string;
    a: string[];
    correct: number;
    explanation?: string;
    category?: string;
}

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
}

const CATEGORIES: Category[] = [
    {
        id: 'all',
        name: 'Tous',
        icon: <Sparkles size={20} color="#9333EA" />,
        color: '#9333EA',
        bgColor: '#F3E8FF',
        description: 'Mix de toutes les catégories'
    },
    {
        id: 'rules',
        name: 'Règles',
        icon: <Book size={20} color="#0EA5E9" />,
        color: '#0EA5E9',
        bgColor: '#E0F2FE',
        description: 'Pénalités, zones, temps de jeu'
    },
    {
        id: 'history',
        name: 'Histoire',
        icon: <History size={20} color="#F59E0B" />,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        description: 'Champions et records'
    },
    {
        id: 'players',
        name: 'Joueurs',
        icon: <Users size={20} color="#10B981" />,
        color: '#10B981',
        bgColor: '#D1FAE5',
        description: 'Positions et rôles'
    },
    {
        id: 'teams',
        name: 'Équipes',
        icon: <Shield size={20} color="#EF4444" />,
        color: '#EF4444',
        bgColor: '#FEE2E2',
        description: 'Ligue Magnus & clubs'
    },
];

// Fallback questions if database is empty
const FALLBACK_QUESTIONS: Question[] = [
    { q: "Quelle équipe a remporté le plus de titres de Ligue Magnus ?", a: ["Rouen", "Grenoble", "Bordeaux", "Amiens"], correct: 0, category: 'history' },
    { q: "Combien de joueurs d'une équipe sont sur la glace en temps normal ?", a: ["4", "5", "6", "7"], correct: 2, category: 'rules' },
    { q: "Quelle est la durée d'une pénalité mineure ?", a: ["1 minute", "2 minutes", "5 minutes", "10 minutes"], correct: 1, category: 'rules' },
    { q: "Comment s'appelle la zone devant le but ?", a: ["Zone bleue", "Crease", "Slot", "Trapèze"], correct: 1, category: 'rules' },
    { q: "Quelle couleur est la ligne centrale ?", a: ["Bleue", "Rouge", "Noire", "Blanche"], correct: 1, category: 'rules' },
];

export function QuizGame({ onScore }: QuizGameProps) {
    const [gameState, setGameState] = useState<'category' | 'loading' | 'playing' | 'finished'>('category');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [progress] = useState(new Animated.Value(1));
    const [showExplanation, setShowExplanation] = useState(false);

    // Fetch questions from Supabase on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('question, options, correct_answer, explanation, category');

        if (!error && data && data.length > 0) {
            const formatted = data.map(q => ({
                q: q.question,
                a: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                correct: q.correct_answer,
                explanation: q.explanation,
                category: q.category || 'general'
            }));
            setAllQuestions(formatted);
        } else {
            setAllQuestions(FALLBACK_QUESTIONS);
        }
    };

    const startGame = (categoryId: string) => {
        setSelectedCategory(categoryId);

        if (allQuestions.length === 0) {
            setGameState('loading');
            fetchQuestions().then(() => setGameState('category'));
            return;
        }

        let questionsToUse = allQuestions.length > 0 ? allQuestions : FALLBACK_QUESTIONS;

        // Filter by category if not 'all'
        if (categoryId !== 'all') {
            questionsToUse = questionsToUse.filter(q => q.category === categoryId);
        }

        // Fallback if no questions in category
        if (questionsToUse.length === 0) {
            questionsToUse = allQuestions.length > 0 ? allQuestions : FALLBACK_QUESTIONS;
        }

        const shuffled = [...questionsToUse].sort(() => Math.random() - 0.5).slice(0, 5);
        setShuffledQuestions(shuffled);
        setGameState('playing');
        setQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setTimeLeft(15);
        setSelectedAnswer(null);
        setShowExplanation(false);
        progress.setValue(1);
    };

    const handleAnswer = useCallback((index: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(index);
        const isCorrect = index === shuffledQuestions[questionIndex].correct;

        if (isCorrect) {
            const streakBonus = streak >= 2 ? 5 : 0;
            setScore(prev => prev + 10 + timeLeft + streakBonus);
            setStreak(prev => prev + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            setStreak(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        // Show explanation if available
        if (shuffledQuestions[questionIndex].explanation) {
            setShowExplanation(true);
        }

        setTimeout(() => {
            if (questionIndex < shuffledQuestions.length - 1) {
                setQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setTimeLeft(15);
                progress.setValue(1);
            } else {
                setGameState('finished');
                if (onScore) onScore(score + (isCorrect ? 10 + timeLeft : 0));
            }
        }, showExplanation ? 2500 : 1200);
    }, [questionIndex, selectedAnswer, timeLeft, shuffledQuestions, score, streak, onScore, progress, showExplanation]);

    useEffect(() => {
        if (gameState !== 'playing' || selectedAnswer !== null) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswer(-1); // Time out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        Animated.timing(progress, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: false,
        }).start();

        return () => clearInterval(timer);
    }, [gameState, questionIndex, selectedAnswer, handleAnswer, progress]);

    // ============ CATEGORY SELECTION SCREEN ============
    if (gameState === 'category') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[Colors.france.blue, Colors.france.blueDark]}
                    style={StyleSheet.absoluteFillObject}
                />
                <ScrollView
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Brain size={40} color={Colors.white} />
                        </View>
                        <Typo variant="h2" weight="black" color={Colors.white} style={{ textAlign: 'center' }}>
                            Quiz Hockey
                        </Typo>
                        <Typo variant="caption" color="rgba(255,255,255,0.7)" style={{ textAlign: 'center', marginTop: 4 }}>
                            Choisis une catégorie
                        </Typo>
                    </View>

                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.categoryCard}
                                onPress={() => startGame(cat.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: cat.bgColor }]}>
                                    {cat.icon}
                                </View>
                                <View style={styles.categoryTexts}>
                                    <Typo variant="body" weight="bold" color={Colors.night}>
                                        {cat.name}
                                    </Typo>
                                    <Typo variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                                        {cat.description}
                                    </Typo>
                                </View>
                                <ArrowRight size={18} color={cat.color} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.infoBox}>
                        <Typo variant="caption" color="rgba(255,255,255,0.8)" style={{ textAlign: 'center' }}>
                            🎯 5 questions • 15 sec/question{'\n'}
                            🔥 Bonus de série pour les bonnes réponses !
                        </Typo>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // ============ FINISHED SCREEN ============
    if (gameState === 'finished') {
        const category = CATEGORIES.find(c => c.id === selectedCategory);
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.finishedContent}>
                    <Trophy size={56} color={Colors.gold} />
                    <Typo variant="h1" weight="black" color={Colors.white}>{score} XP</Typo>
                    <Typo variant="body" color="rgba(255,255,255,0.8)">Félicitations !</Typo>

                    {category && (
                        <View style={styles.categoryBadge}>
                            {category.icon}
                            <Typo variant="caption" weight="bold" color={Colors.night}>
                                {category.name}
                            </Typo>
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        <TactileButton style={styles.restartBtn} onPress={() => startGame(selectedCategory)}>
                            <RefreshCw size={18} color={Colors.night} />
                            <Typo variant="body" weight="bold" color={Colors.night}>Rejouer</Typo>
                        </TactileButton>
                        <TactileButton style={styles.changeCatBtn} onPress={() => setGameState('category')}>
                            <Typo variant="caption" weight="bold" color={Colors.white}>Catégories</Typo>
                        </TactileButton>
                    </View>
                </View>
            </View>
        );
    }

    // ============ PLAYING SCREEN ============
    const currentQ = shuffledQuestions[questionIndex];
    const category = CATEGORIES.find(c => c.id === currentQ?.category) || CATEGORIES[0];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.night, '#1a1a2e']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.questionCounter}>
                    <Typo variant="caption" weight="bold" color={Colors.white}>
                        {questionIndex + 1}/{shuffledQuestions.length}
                    </Typo>
                </View>

                {/* Streak indicator */}
                {streak >= 2 && (
                    <View style={styles.streakBadge}>
                        <Typo variant="caption" weight="bold" color="#F59E0B">
                            🔥 x{streak}
                        </Typo>
                    </View>
                )}

                <View style={styles.timerContainer}>
                    <Clock size={14} color={timeLeft <= 5 ? Colors.france.red : Colors.white} />
                    <Typo
                        variant="body"
                        weight="black"
                        color={timeLeft <= 5 ? Colors.france.red : Colors.white}
                    >
                        {timeLeft}s
                    </Typo>
                </View>
                <View style={styles.scoreContainer}>
                    <Typo variant="caption" weight="bold" color={Colors.gold}>{score} XP</Typo>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        {
                            width: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            }),
                            backgroundColor: timeLeft <= 5 ? Colors.france.red : category.color
                        }
                    ]}
                />
            </View>

            {/* Category Badge */}
            <View style={styles.categoryIndicator}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Typo variant="caption" color="rgba(255,255,255,0.6)">{category.name}</Typo>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
                <Typo variant="h3" weight="bold" color={Colors.white} style={{ textAlign: 'center' }}>
                    {currentQ.q}
                </Typo>
            </View>

            {/* Explanation (if shown) */}
            {showExplanation && currentQ.explanation && (
                <View style={styles.explanationBox}>
                    <Typo variant="caption" color={Colors.white} style={{ textAlign: 'center' }}>
                        💡 {currentQ.explanation}
                    </Typo>
                </View>
            )}

            {/* Answers */}
            <View style={styles.answersContainer}>
                {currentQ.a.map((answer, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQ.correct;
                    const showResult = selectedAnswer !== null;

                    let bgColor = 'rgba(255,255,255,0.1)';
                    if (showResult) {
                        if (isCorrect) bgColor = '#10B981';
                        else if (isSelected && !isCorrect) bgColor = '#EF4444';
                    }

                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.answerBtn, { backgroundColor: bgColor }]}
                            onPress={() => handleAnswer(idx)}
                            disabled={selectedAnswer !== null}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.answerLetter, showResult && isCorrect && styles.answerLetterCorrect]}>
                                <Typo variant="caption" weight="black" color={Colors.white}>
                                    {String.fromCharCode(65 + idx)}
                                </Typo>
                            </View>
                            <Typo variant="body" weight="bold" color={Colors.white}>{answer}</Typo>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Category Selection
    categoryScroll: {
        flex: 1,
    },
    categoryScrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    categoryHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoriesGrid: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTexts: {
        flex: 1,
    },
    infoBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },

    // Finished
    finishedContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    restartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.white,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    changeCatBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
    },

    // Playing
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionCounter: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    streakBadge: {
        backgroundColor: 'rgba(245,158,11,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    scoreContainer: {
        backgroundColor: 'rgba(255,200,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    categoryIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    questionContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    explanationBox: {
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    answersContainer: {
        padding: 16,
        gap: 10,
    },
    answerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
    },
    answerLetter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerLetterCorrect: {
        backgroundColor: '#10B981',
    },
});
