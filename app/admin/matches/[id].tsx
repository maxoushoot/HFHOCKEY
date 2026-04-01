import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LiquidContainer } from '../../../components/ui/LiquidContainer';
import { Typo } from '../../../components/ui/Typography';
import { Colors } from '../../../constants/Colors';
import { supabase } from '../../../lib/supabase';

export default function EditMatch() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isNew = id === 'new';

    const [form, setForm] = useState({
        home_team_id: '',
        away_team_id: '',
        date: new Date().toISOString(),
        status: 'scheduled',
        home_score: '0',
        away_score: '0',
        current_period: '',
        timer: ''
    });

    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        loadTeams();
        if (!isNew) loadMatch();
    }, [id]);

    const loadTeams = async () => {
        const { data } = await supabase.from('teams').select('id, name').order('name');
        if (data) setTeams(data);
    };

    const loadMatch = async () => {
        const { data } = await supabase.from('matches').select('*').eq('id', id).single();
        if (data) {
            setForm({
                ...data,
                home_score: String(data.home_score),
                away_score: String(data.away_score),
            });
        }
    };

    const save = async () => {
        const payload = {
            ...form,
            home_score: parseInt(form.home_score) || 0,
            away_score: parseInt(form.away_score) || 0,
        };

        let error;
        if (isNew) {
            const { error: err } = await supabase.from('matches').insert(payload);
            error = err;
        } else {
            const { error: err } = await supabase.from('matches').update(payload).eq('id', id);
            error = err;
        }

        if (error) {
            Alert.alert("Erreur", error.message);
        } else {
            Alert.alert("Succès", "Match enregistré");
            router.back();
        }
    };

    const deleteMatch = async () => {
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (!error) router.back();
    };

    return (
        <LiquidContainer>
            <Stack.Screen options={{ title: isNew ? "Nouveau Match" : "Modifier Match" }} />

            <ScrollView contentContainerStyle={styles.form}>
                <Typo variant="h3" color={Colors.night} style={{ marginBottom: 16 }}>Détails</Typo>

                <FormInput label="Date (ISO)" value={form.date} onChangeText={(t: string) => setForm({ ...form, date: t })} />
                <FormInput label="Statut (scheduled, live, finished)" value={form.status} onChangeText={(t: string) => setForm({ ...form, status: t })} />

                <View style={styles.row}>
                    <FormInput label="Score Domicile" value={form.home_score} onChangeText={(t: string) => setForm({ ...form, home_score: t })} flex />
                    <FormInput label="Score Extérieur" value={form.away_score} onChangeText={(t: string) => setForm({ ...form, away_score: t })} flex />
                </View>

                {/* Team Selection would be better with a Picker, but Text Input ID for now for speed */}
                <Typo variant="caption" color={Colors.textSecondary} style={{ marginTop: 16 }}>IDs Équipes (Voir liste ci-dessous)</Typo>
                <FormInput label="ID Domicile" value={String(form.home_team_id)} onChangeText={(t: string) => setForm({ ...form, home_team_id: t })} />
                <FormInput label="ID Extérieur" value={String(form.away_team_id)} onChangeText={(t: string) => setForm({ ...form, away_team_id: t })} />

                <TouchableOpacity style={styles.saveBtn} onPress={save}>
                    <Typo weight="bold" color={Colors.white}>ENREGISTRER</Typo>
                </TouchableOpacity>

                {!isNew && (
                    <TouchableOpacity style={styles.delBtn} onPress={deleteMatch}>
                        <Typo weight="bold" color={Colors.alertRed}>SUPPRIMER</Typo>
                    </TouchableOpacity>
                )}

                <Typo variant="h3" style={{ marginTop: 32 }}>Liste ID Équipes</Typo>
                {teams.map(t => (
                    <Typo key={t.id} variant="caption" color={Colors.textSecondary}>{t.id}: {t.name}</Typo>
                ))}
            </ScrollView>
        </LiquidContainer>
    );
}

const FormInput = ({ label, value, onChangeText, flex }: any) => (
    <View style={{ marginBottom: 12, flex: flex ? 1 : 0, marginRight: flex ? 8 : 0 }}>
        <Typo variant="caption" color={Colors.textSecondary} style={{ marginBottom: 4 }}>{label}</Typo>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#999"
        />
    </View>
);

const styles = StyleSheet.create({
    form: { padding: 24, paddingTop: 100 },
    row: { flexDirection: 'row' },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: Colors.night,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    delBtn: {
        marginTop: 12,
        padding: 16,
        alignItems: 'center',
    }
});
