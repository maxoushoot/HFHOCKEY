import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function AdminNews() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) Alert.alert('Erreur', error.message);
        else setNews(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!title || !content) {
            Alert.alert('Erreur', 'Titre et contenu requis');
            return;
        }

        const payload = { title, content, image_url: imageUrl, updated_at: new Date() };

        let error;
        if (editingItem) {
            const { error: err } = await supabase
                .from('news')
                .update(payload)
                .eq('id', editingItem.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('news')
                .insert(payload);
            error = err;
        }

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            setModalVisible(false);
            fetchNews();
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
                        const { error } = await supabase.from('news').delete().eq('id', id);
                        if (error) Alert.alert('Erreur', error.message);
                        else fetchNews();
                    }
                }
            ]
        );
    };

    const openEditor = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setContent(item.content);
            setImageUrl(item.image_url || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setContent('');
        setImageUrl('');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.cardImage} />}
            <View style={styles.cardContent}>
                <Typo variant="h3" weight="bold" color={Colors.night}>{item.title}</Typo>
                <Typo variant="caption" color={Colors.textSecondary} numberOfLines={2}>{item.content}</Typo>
                <Typo variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                    {new Date(item.published_at).toLocaleDateString()}
                </Typo>
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
            <Stack.Screen options={{ headerTitle: 'Gestion Actualités' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Actualités</Typo>
                    <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={news}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchNews}
                />
            </View>

            {/* Editor Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingItem ? 'Modifier' : 'Nouvelle Actualité'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Titre</Typo>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Titre de l'article"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Image URL</Typo>
                            <TextInput
                                style={styles.input}
                                value={imageUrl}
                                onChangeText={setImageUrl}
                                placeholder="https://..."
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Contenu</Typo>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                placeholder="Contenu de l'article..."
                                textAlignVertical="top"
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
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'row',
        padding: 12,
        gap: 12,
        alignItems: 'center',
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: Colors.slate,
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
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    textArea: {
        height: 200,
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
