import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { Plus, Send, X } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) Alert.alert('Erreur', error.message);
        else setNotifications(data || []);
        setLoading(false);
    };

    const handleSend = async () => {
        if (!title || !body) {
            Alert.alert('Erreur', 'Titre et message requis');
            return;
        }

        const payload = {
            title,
            body,
            user_id: null, // Broadcast to all
            created_at: new Date()
        };

        const { error } = await supabase.from('notifications').insert(payload);

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            Alert.alert('Succès', 'Notification envoyée (simulée)');
            // In a real app, this would trigger an Edge Function to call Expo Push API
            setModalVisible(false);
            fetchNotifications();
            setTitle('');
            setBody('');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.iconBox}>
                <Send size={20} color={Colors.white} />
            </View>
            <View style={styles.cardContent}>
                <Typo variant="body" weight="bold" color={Colors.night}>{item.title}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>{item.body}</Typo>
                <Typo variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                    {new Date(item.created_at).toLocaleString()}
                </Typo>
            </View>
        </View>
    );

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerTitle: 'Notifications' }} />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Historique</Typo>
                    <TactileButton style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <Plus size={24} color={Colors.white} />
                    </TactileButton>
                </View>

                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchNotifications}
                />
            </View>

            {/* Send Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>Envoyer Notification</Typo>
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
                                placeholder="BUT !!!"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Message</Typo>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={body}
                                onChangeText={setBody}
                                multiline
                                placeholder="La France vient de marquer..."
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Typo variant="caption" color={Colors.textSecondary}>
                                Cette action créera une notification dans la base de données. Pour l'envoi Push réel, une Edge Function doit être configurée.
                            </Typo>
                        </View>

                        <TactileButton style={styles.sendBtn} onPress={handleSend}>
                            <Send size={20} color={Colors.white} />
                            <Typo variant="body" weight="bold" color={Colors.white}>Envoyer à tous</Typo>
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
        padding: 16,
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
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
    },
    infoBox: {
        padding: 12,
        backgroundColor: Colors.snowSecondary,
        borderRadius: 8,
    },
    sendBtn: {
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
