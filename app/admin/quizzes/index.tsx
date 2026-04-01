import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Plus, Trash2, Edit2, X, Save, ChevronDown, ChevronUp } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

interface QuizItem {
    id: string;
    title: string;
    difficulty?: string;
}

interface QuestionItem {
    id: string;
    quiz_id: string;
    question: string;
    options: string | string[];
    correct_answer: number;
    explanation?: string;
}

export default function AdminQuizzes() {
    const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
    const [questions, setQuestions] = useState<QuestionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

    // Form State for new question
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [explanation, setExplanation] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch quizzes
        const { data: quizzesData } = await supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch all questions
        const { data: questionsData } = await supabase
            .from('quiz_questions')
            .select('*')
            .order('question');

        setQuizzes(quizzesData || []);
        setQuestions(questionsData || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!question || !option1 || !option2 || !selectedQuizId) {
            Alert.alert('Erreur', 'Question, 2 options minimum et quiz requis');
            return;
        }

        const options = [option1, option2, option3, option4].filter(o => o.trim());

        const payload = {
            quiz_id: selectedQuizId,
            question,
            options: JSON.stringify(options),
            correct_answer: correctAnswer,
            explanation
        };

        try {
            let error;
            if (editingId) {
                ({ error } = await supabase.from('quiz_questions').update(payload).eq('id', editingId));
            } else {
                ({ error } = await supabase.from('quiz_questions').insert(payload));
            }

            if (error) throw error;

            setModalVisible(false);
            fetchData();
            resetForm();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Erreur inconnue";
            Alert.alert('Erreur', msg);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Supprimer', 'Supprimer cette question ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
                        if (error) throw error;
                        fetchData();
                    } catch (error: unknown) {
                        console.error(error);
                        const msg = error instanceof Error ? error.message : "Erreur inconnue";
                        Alert.alert('Erreur', msg);
                    }
                }
            }
        ]);
    };

    const openEditor = (item?: QuestionItem) => {
        if (item) {
            setEditingId(item.id);
            setSelectedQuizId(item.quiz_id);
            setQuestion(item.question);
            const opts = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            setOption1(opts[0] || '');
            setOption2(opts[1] || '');
            setOption3(opts[2] || '');
            setOption4(opts[3] || '');
            setCorrectAnswer(item.correct_answer);
            setExplanation(item.explanation || '');
        } else {
            resetForm();
            if (quizzes.length > 0) setSelectedQuizId(quizzes[0].id);
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setQuestion('');
        setOption1('');
        setOption2('');
        setOption3('');
        setOption4('');
        setCorrectAnswer(0);
        setExplanation('');
    };

    const getQuestionsForQuiz = (quizId: string) => questions.filter(q => q.quiz_id === quizId);

    const renderQuiz = ({ item }: { item: QuizItem }) => {
        const isExpanded = expandedQuiz === item.id;
        const quizQuestions = getQuestionsForQuiz(item.id);

        return (
            <View style={styles.quizCard}>
                <TouchableOpacity
                    style={styles.quizHeader}
                    onPress={() => setExpandedQuiz(isExpanded ? null : item.id)}
                >
                    <View style={{ flex: 1 }}>
                        <Typo variant="h3" weight="bold" color={Colors.night}>{item.title}</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>
                            {quizQuestions.length} questions • {item.difficulty || 'Normal'}
                        </Typo>
                    </View>
                    {isExpanded ? (
                        <ChevronUp size={20} color={Colors.textSecondary} />
                    ) : (
                        <ChevronDown size={20} color={Colors.textSecondary} />
                    )}
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.questionsContainer}>
                        {quizQuestions.map((q, idx) => (
                            <View key={q.id} style={styles.questionItem}>
                                <Typo variant="body" color={Colors.night} numberOfLines={2}>
                                    {idx + 1}. {q.question}
                                </Typo>
                                <View style={styles.questionActions}>
                                    <TactileButton onPress={() => openEditor(q)} style={styles.actionBtn}>
                                        <Edit2 size={16} color={Colors.primary} />
                                    </TactileButton>
                                    <TactileButton onPress={() => handleDelete(q.id)} style={styles.actionBtn}>
                                        <Trash2 size={16} color={Colors.alertRed} />
                                    </TactileButton>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerTitle: 'Gestion Quiz' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View>
                        <Typo variant="h2" weight="black" color={Colors.night}>Quiz</Typo>
                        <Typo variant="caption" color={Colors.textSecondary}>
                            {questions.length} questions au total
                        </Typo>
                    </View>
                    <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={quizzes}
                    renderItem={renderQuiz}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchData}
                    ListEmptyComponent={
                        <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 40 }}>
                            Aucun quiz. Créez-en un dans Supabase.
                        </Typo>
                    }
                />
            </View>

            {/* Edit/Create Question Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingId ? 'Modifier Question' : 'Nouvelle Question'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Quiz</Typo>
                            <View style={styles.quizSelector}>
                                {quizzes.map(q => (
                                    <TouchableOpacity
                                        key={q.id}
                                        style={[styles.quizOption, selectedQuizId === q.id && styles.quizOptionActive]}
                                        onPress={() => setSelectedQuizId(q.id)}
                                    >
                                        <Typo variant="caption" weight="bold" color={selectedQuizId === q.id ? Colors.white : Colors.night}>
                                            {q.title}
                                        </Typo>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Question</Typo>
                            <TextInput
                                style={styles.input}
                                value={question}
                                onChangeText={setQuestion}
                                placeholder="Quelle équipe..."
                                multiline
                            />
                        </View>

                        {[option1, option2, option3, option4].map((opt, idx) => (
                            <View key={idx} style={styles.inputGroup}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Typo variant="caption" weight="bold" color={Colors.textSecondary}>
                                        Option {idx + 1} {idx < 2 ? '*' : ''}
                                    </Typo>
                                    <TouchableOpacity onPress={() => setCorrectAnswer(idx)}>
                                        <Typo variant="caption" weight="bold" color={correctAnswer === idx ? Colors.success : Colors.textSecondary}>
                                            {correctAnswer === idx ? '✓ Correct' : 'Marquer correct'}
                                        </Typo>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, correctAnswer === idx && styles.correctInput]}
                                    value={[option1, option2, option3, option4][idx]}
                                    onChangeText={[setOption1, setOption2, setOption3, setOption4][idx]}
                                    placeholder={`Option ${idx + 1}`}
                                />
                            </View>
                        ))}

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Explication (optionnel)</Typo>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                value={explanation}
                                onChangeText={setExplanation}
                                placeholder="Explication de la réponse..."
                                multiline
                            />
                        </View>

                        <TactileButton style={styles.saveBtn} onPress={handleSave}>
                            <Save size={20} color={Colors.white} />
                            <Typo variant="body" weight="bold" color={Colors.white}>
                                {editingId ? 'Enregistrer' : 'Créer Question'}
                            </Typo>
                        </TactileButton>
                    </ScrollView>
                </View>
            </Modal>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        gap: 16,
        paddingBottom: 40,
    },
    quizCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
    },
    quizHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    questionsContainer: {
        borderTopWidth: 1,
        borderTopColor: Colors.slate,
        padding: 12,
        gap: 8,
    },
    questionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: Colors.snowSecondary,
        borderRadius: 8,
        paddingRight: 8,
    },
    questionActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate,
    },
    form: {
        padding: 20,
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    correctInput: {
        borderColor: Colors.success,
        borderWidth: 2,
    },
    quizSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quizOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.snowSecondary,
        borderRadius: 12,
    },
    quizOptionActive: {
        backgroundColor: Colors.primary,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginTop: 20,
    }
});
