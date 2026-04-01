import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typo } from '../../components/ui/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Key, Save, Lock } from 'lucide-react-native';
import { TactileButton } from '../../components/ui/TactileButton';
import { supabase } from '../../lib/supabase';

export default function SecurityScreen() {
    const { text, card, colorMode } = useTheme();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setLoading(false);

        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            Alert.alert('Succès', 'Votre mot de passe a été mis à jour.');
            router.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.background }]}>
            <Stack.Screen options={{ title: 'Sécurité', headerTintColor: text, headerStyle: { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.white } }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Shield size={48} color={Colors.france.blue} />
                    <Typo variant="h2" weight="black" color={text} style={{ marginTop: 16 }}>Mot de passe</Typo>
                    <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                        Gérez vos paramètres de sécurité et changez votre mot de passe.
                    </Typo>
                </View>

                <View style={[styles.card, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                    <View style={styles.inputGroup}>
                        <Typo variant="caption" weight="bold" color={text} style={{ marginBottom: 8 }}>Nouveau mot de passe</Typo>
                        <View style={[styles.inputContainer, { backgroundColor: colorMode === 'dark' ? '#0F172A' : '#F8FAFC' }]}>
                            <Lock size={20} color={Colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: text }]}
                                placeholder="Au moins 6 caractères"
                                placeholderTextColor={Colors.textSecondary}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Typo variant="caption" weight="bold" color={text} style={{ marginBottom: 8 }}>Confirmer le mot de passe</Typo>
                        <View style={[styles.inputContainer, { backgroundColor: colorMode === 'dark' ? '#0F172A' : '#F8FAFC' }]}>
                            <Key size={20} color={Colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: text }]}
                                placeholder="Répétez le mot de passe"
                                placeholderTextColor={Colors.textSecondary}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    <TactileButton onPress={handleUpdatePassword} style={styles.saveBtn} disabled={loading}>
                        <Save size={20} color={Colors.white} />
                        <Typo variant="body" weight="bold" color={Colors.white}>
                            {loading ? 'Mise à jour...' : 'Enregistrer'}
                        </Typo>
                    </TactileButton>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.france.blue,
        height: 56,
        borderRadius: 16,
        marginTop: 8,
    },
});
