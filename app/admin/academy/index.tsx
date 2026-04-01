import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Plus, Trash2, Edit2, X, Save, BookOpen } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

const CATEGORIES = ['Règles', 'Tactique', 'Statistiques'];

export default function AdminAcademy() {
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [term, setTerm] = useState('');
    const [definition, setDefinition] = useState('');
    const [category, setCategory] = useState('Règles');

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('glossary_terms')
            .select('*')
            .order('term');

        if (error) Alert.alert('Erreur', error.message);
        else setTerms(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!term || !definition) {
            Alert.alert('Erreur', 'Terme et définition requis');
            return;
        }

        const payload = { term, definition, category };

        let error;
        if (editingItem) {
            const { error: err } = await supabase
                .from('glossary_terms')
                .update(payload)
                .eq('id', editingItem.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('glossary_terms')
                .insert(payload);
            error = err;
        }

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            setModalVisible(false);
            fetchTerms();
            resetForm();
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Supprimer",
            "Êtes-vous sûr ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('glossary_terms').delete().eq('id', id);
                        if (error) Alert.alert('Erreur', error.message);
                        else fetchTerms();
                    }
                }
            ]
        );
    };

    const openEditor = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setTerm(item.term);
            setDefinition(item.definition);
            setCategory(item.category);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTerm('');
        setDefinition('');
        setCategory('Règles');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: Colors.france.blue + '20' }]}>
                <BookOpen size={20} color={Colors.france.blue} />
            </View>
            <View style={styles.cardContent}>
                <Typo variant="body" weight="bold" color={Colors.night}>{item.term}</Typo>
                <Typo variant="caption" color={Colors.textSecondary} numberOfLines={1}>{item.definition}</Typo>
                <View style={styles.categoryBadge}>
                    <Typo variant="caption" weight="bold" color={Colors.france.blue} style={{ fontSize: 10 }}>
                        {item.category}
                    </Typo>
                </View>
            </View>
            <View style={styles.cardActions}>
                <TactileButton onPress={() => openEditor(item)} style={styles.actionBtn}>
                    <Edit2 size={18} color={Colors.primary} />
                </TactileButton>
                <TactileButton onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Trash2 size={18} color={Colors.alertRed} />
                </TactileButton>
            </View>
        </View>
    );

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerTitle: 'Gestion Académie' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Académie</Typo>
                    <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={terms}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchTerms}
                />
            </View>

            {/* Editor Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingItem ? 'Modifier' : 'Nouveau Terme'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Terme</Typo>
                            <TextInput
                                style={styles.input}
                                value={term}
                                onChangeText={setTerm}
                                placeholder="ex: Power Play"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Catégorie</Typo>
                            <View style={styles.categoryPicker}>
                                {CATEGORIES.map(cat => (
                                    <TactileButton
                                        key={cat}
                                        style={[styles.catBtn, category === cat && styles.catBtnActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Typo
                                            variant="caption"
                                            weight="bold"
                                            color={category === cat ? Colors.white : Colors.textSecondary}
                                        >
                                            {cat}
                                        </Typo>
                                    </TactileButton>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Définition</Typo>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={definition}
                                onChangeText={setDefinition}
                                placeholder="Définition du terme..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TactileButton style={styles.saveBtn} onPress={handleSave}>
                            <Save size={20} color={Colors.white} />
                            <Typo variant="body" weight="bold" color={Colors.white}>Enregistrer</Typo>
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
        gap: 12,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 2,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.france.blue + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.snowSecondary,
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
        gap: 20,
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    categoryPicker: {
        flexDirection: 'row',
        gap: 8,
    },
    catBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.slate,
    },
    catBtnActive: {
        backgroundColor: Colors.france.blue,
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
