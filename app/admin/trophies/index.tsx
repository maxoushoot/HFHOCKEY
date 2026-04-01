import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Plus, Trash2, Edit2, X, Save, Trophy } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';

interface TrophyItem {
    id: string;
    name: string;
    description?: string;
    condition_description?: string;
    icon: string;
    color: string;
}

export default function AdminTrophies() {
    const [trophies, setTrophies] = useState<TrophyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<TrophyItem | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [conditionDescription, setConditionDescription] = useState('');
    const [iconName, setIconName] = useState('Award');
    const [color, setColor] = useState('#3B82F6');

    useEffect(() => {
        fetchTrophies();
    }, []);

    const fetchTrophies = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('trophies')
            .select('*')
            .order('created_at');

        if (error) Alert.alert('Erreur', error.message);
        else setTrophies(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!name || !iconName) {
            Alert.alert('Erreur', 'Nom et Icône requis');
            return;
        }

        const payload = {
            name,
            description,
            condition_description: conditionDescription,
            icon: iconName,
            color
        };

        try {
            let error;
            if (editingItem) {
                const { error: err } = await supabase
                    .from('trophies')
                    .update(payload)
                    .eq('id', editingItem.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('trophies')
                    .insert(payload);
                error = err;
            }

            if (error) throw error;

            setModalVisible(false);
            fetchTrophies();
            resetForm();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Erreur inconnue";
            Alert.alert('Erreur', msg);
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
                        try {
                            const { error } = await supabase.from('trophies').delete().eq('id', id);
                            if (error) throw error;
                            fetchTrophies();
                        } catch (error: unknown) {
                            console.error(error);
                            const msg = error instanceof Error ? error.message : "Erreur inconnue";
                            Alert.alert('Erreur', msg);
                        }
                    }
                }
            ]
        );
    };

    const openEditor = (item?: TrophyItem) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setDescription(item.description || '');
            setConditionDescription(item.condition_description || '');
            setIconName(item.icon);
            setColor(item.color);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setName('');
        setDescription('');
        setConditionDescription('');
        setIconName('Award');
        setColor('#3B82F6');
    };

    const renderItem = ({ item }: { item: TrophyItem }) => {
        return (
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                    {/* @ts-ignore */}
                    <LucideIcons.Trophy size={24} color={item.color} />
                    {/* Ideally dynamically render icon, but for safety in admin list we use generic or try catch */}
                </View>
                <View style={styles.cardContent}>
                    <Typo variant="body" weight="bold" color={Colors.night}>{item.name}</Typo>
                    <Typo variant="caption" color={Colors.textSecondary}>{item.condition_description}</Typo>
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
    };

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerTitle: 'Gestion Trophées' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Trophées</Typo>
                    <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={trophies}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchTrophies}
                />
            </View>

            {/* Editor Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingItem ? 'Modifier' : 'Nouveau Trophée'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Nom</Typo>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="ex: Buteur"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Condition (Description courte)</Typo>
                            <TextInput
                                style={styles.input}
                                value={conditionDescription}
                                onChangeText={setConditionDescription}
                                placeholder="ex: Marquer 10 buts"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Description (Détail)</Typo>
                            <TextInput
                                style={styles.input}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Description complète..."
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Icône (Lucide Name)</Typo>
                                <TextInput
                                    style={styles.input}
                                    value={iconName}
                                    onChangeText={setIconName}
                                    placeholder="ex: Award"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Couleur (Hex)</Typo>
                                <TextInput
                                    style={styles.input}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="#RRGGBB"
                                />
                            </View>
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
        gap: 16,
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
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
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
    row: {
        flexDirection: 'row',
        gap: 20,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
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
