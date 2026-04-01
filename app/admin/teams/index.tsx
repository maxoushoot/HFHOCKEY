import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Edit2, X, Save, Search, Plus, Trash2 } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function AdminTeams() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .order('name');

        if (error) Alert.alert('Erreur', error.message);
        else setTeams(data || []);
        setLoading(false);
    };

    const openEditor = (item?: any) => {
        if (item) {
            setEditingTeam(item);
            setName(item.name);
            setColor(item.color || '');
            setSecondaryColor(item.secondary_color || '');
            setLogoUrl(item.logo_url || '');
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        const payload = {
            name: name, // Allow name editing for new teams
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), // Generate slug
            color,
            secondary_color: secondaryColor,
            logo_url: logoUrl
        };

        let error;
        if (editingTeam) {
            // If editing, maybe don't change slug? Keep it simple.
            const { error: err } = await supabase
                .from('teams')
                .update({ color, secondary_color: secondaryColor, logo_url: logoUrl, name })
                .eq('id', editingTeam.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('teams')
                .insert(payload);
            error = err;
        }

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            setModalVisible(false);
            fetchTeams();
            resetForm();
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Supprimer",
            "Êtes-vous sûr ? Cela supprimera aussi les joueurs et matchs associés !",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('teams').delete().eq('id', id);
                        if (error) Alert.alert('Erreur', error.message);
                        else fetchTeams();
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setEditingTeam(null);
        setName('');
        setColor('#000000');
        setSecondaryColor('#FFFFFF');
        setLogoUrl('');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={[styles.colorDot, { backgroundColor: item.color || Colors.slate }]} />
            {item.logo_url ? (
                <Image source={{ uri: item.logo_url }} style={styles.logo} />
            ) : (
                <View style={[styles.logo, { backgroundColor: Colors.slate }]} />
            )}
            <View style={styles.cardContent}>
                <Typo variant="body" weight="bold" color={Colors.night}>{item.name}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>{item.slug}</Typo>
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
            <Stack.Screen options={{ headerTitle: 'Gestion Équipes' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Équipes</Typo>
                    <TactileButton style={styles.addBtn} onPress={() => openEditor()}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={teams}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchTeams}
                />
            </View>

            {/* Editor Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>
                            {editingTeam ? 'Modifier Équipe' : 'Nouvelle Équipe'}
                        </Typo>
                        <TactileButton onPress={() => setModalVisible(false)}>
                            <X size={24} color={Colors.night} />
                        </TactileButton>
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <View style={styles.headerInfo}>
                            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.logoPreview} /> : null}
                            <TextInput
                                style={[styles.input, { fontSize: 24, fontWeight: 'bold', width: '100%', textAlign: 'center' }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nom de l'équipe"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Couleur Principale (Hex)</Typo>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={[styles.colorPreview, { backgroundColor: color || '#FFF' }]} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="#RRGGBB"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Couleur Secondaire (Hex)</Typo>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={[styles.colorPreview, { backgroundColor: secondaryColor || '#FFF' }]} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={secondaryColor}
                                    onChangeText={setSecondaryColor}
                                    placeholder="#RRGGBB"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Logo URL</Typo>
                            <TextInput
                                style={styles.input}
                                value={logoUrl}
                                onChangeText={setLogoUrl}
                                placeholder="https://..."
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
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        alignItems: 'center',
        gap: 16,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
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
    headerInfo: {
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    logoPreview: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
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
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
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
