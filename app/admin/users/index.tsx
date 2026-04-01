import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, Switch } from 'react-native';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { TactileButton } from '../../../components/ui/TactileButton';
import { UserCog, ShieldAlert, Search } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) Alert.alert('Erreur', error.message);
        else setUsers(data || []);
        setLoading(false);
    };

    const toggleAdmin = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        Alert.alert(
            "Changer Rôle",
            `Passer cet utilisateur en ${newRole} ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Confirmer",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('user_profiles')
                            .update({ role: newRole })
                            .eq('id', id);

                        if (error) Alert.alert('Erreur', error.message);
                        else fetchUsers();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={[styles.avatar, item.role === 'admin' && styles.adminAvatar]}>
                <Typo weight="bold" color={item.role === 'admin' ? Colors.white : Colors.night}>
                    {item.full_name?.[0] || '?'}
                </Typo>
            </View>
            <View style={styles.cardContent}>
                <Typo variant="body" weight="bold" color={Colors.night}>{item.full_name || 'Anonyme'}</Typo>
                <Typo variant="caption" color={Colors.textSecondary}>XP: {item.xp || 0}</Typo>
            </View>

            <View style={styles.actions}>
                <TactileButton
                    onPress={() => toggleAdmin(item.id, item.role)}
                    style={[styles.roleBtn, item.role === 'admin' ? styles.adminBtn : styles.userBtn]}
                >
                    <Typo variant="caption" weight="bold" color={item.role === 'admin' ? Colors.white : Colors.textSecondary}>
                        {item.role === 'admin' ? 'ADMIN' : 'USER'}
                    </Typo>
                </TactileButton>
            </View>
        </View>
    );

    return (
        <LiquidContainer safeArea={false}>
            <Stack.Screen options={{ headerTitle: 'Gestion Utilisateurs' }} />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Typo variant="h2" weight="black" color={Colors.night}>Utilisateurs</Typo>
                </View>

                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchUsers}
                />
            </View>
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
        marginBottom: 20,
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
        backgroundColor: Colors.snowSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminAvatar: {
        backgroundColor: Colors.primary,
    },
    cardContent: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    adminBtn: {
        backgroundColor: Colors.primary,
    },
    userBtn: {
        backgroundColor: Colors.snowSecondary,
    }
});
