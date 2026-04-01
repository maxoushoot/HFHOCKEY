import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, Image } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Edit2, X, Save, Search, Filter, Plus, Trash2 } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function AdminPlayers() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [number, setNumber] = useState('');
    const [position, setPosition] = useState('');

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        let query = supabase
            .from('players')
            .select('*, team:teams(name)')
            .order('last_name')
            .limit(50); // Limit for performance, real app needs pagination

        if (searchQuery) {
            query = query.ilike('last_name', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) Alert.alert('Erreur', error.message);
        else setPlayers(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        const payload = {
            first_name: firstName,
            last_name: lastName,
            number: parseInt(number) || 0,
            position,
            // For creation, we might need team_id. For now let's assume a default or require it.
            // Simplified: if creating, require selecting a team? Or just leave null? 
            // The table has team_id. Let's make it optional in UI but ideally it should be set.
            // For this iteration, we'll just allow basic info.
        };

        let error;
        if (editingItem) {
            const { error: err } = await supabase
                .from('players')
                .update(payload)
                .eq('id', editingItem.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('players')
                .insert(payload); // Note: might fail if RLS or constraints require team_id
            error = err;
        }

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            setModalVisible(false);
            fetchPlayers();
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
                        const { error } = await supabase.from('players').delete().eq('id', id);
                        if (error) Alert.alert('Erreur', error.message);
                        else fetchPlayers();
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setEditingItem(null);
        setFirstName('');
        setLastName('');
        setNumber('');
        setPosition('');
    };

    const openEditor = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFirstName(item.first_name);
            setLastName(item.last_name);
            setNumber(item.number?.toString() || '');
            setPosition(item.position || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Typo weight="bold" color={Colors.white}>{item.first_name?.[0]}{item.last_name?.[0]}</Typo>
            </View>
            <View style={styles.cardContent}>
                <Typo variant="body" weight="bold" color={Colors.night}>{item.first_name} {item.last_name} #{item.number}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>{item.position} • {item.team?.name}</Typo>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
            <Stack.Screen options={{ headerTitle: 'Gestion Joueurs' }} />

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typo variant="h2" weight="black" color={Colors.night}>Joueurs</Typo>
                        <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                            <Plus size={24} color={Colors.white} />
                        </TactileButton>
                    </View>

                    <View style={styles.searchBar}>
                        <Search size={20} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={fetchPlayers}
                        />
                        <TactileButton onPress={fetchPlayers}>
                            <Filter size={20} color={Colors.primary} />
                        </TactileButton>
                    </View>
                </View>

                <FlatList
                    data={players}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchPlayers}
                />
            </View>

            {/* Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingItem ? 'Modifier Joueur' : 'Nouveau Joueur'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Prénom</Typo>
                            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Nom</Typo>
                            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Numéro</Typo>
                                <TextInput style={styles.input} value={number} onChangeText={setNumber} keyboardType="numeric" />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Position</Typo>
                                <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="ex: ATT, DÉF, G" />
                            </View>
                        </View>

                        <TactileButton style={styles.saveBtn} onPress={handleSave}>
                            <Save size={20} color={Colors.white} />
                            <Typo variant="body" weight="bold" color={Colors.white}>Enregistrer</Typo>
                        </TactileButton>
                    </View>
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
    header: {
        gap: 16,
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.night,
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
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
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
