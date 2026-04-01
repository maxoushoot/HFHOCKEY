
import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <LiquidContainer>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={Colors.night} size={24} />
                </TouchableOpacity>
                <Typo variant="h3" weight="black" color={Colors.night}>Confidentialité</Typo>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Typo variant="h2" weight="bold" color={Colors.night} style={{ marginBottom: 16 }}>
                    Politique de Confidentialité
                </Typo>
                <Typo variant="body" color={Colors.textSecondary} style={styles.paragraph}>
                    Dernière mise à jour : 09/02/2026
                </Typo>

                <Section title="1. Collecte des données">
                    Nous collectons uniquement les données nécessaires au bon fonctionnement de l'application, notamment votre adresse email, votre pseudonyme et vos préférences d'équipe.
                </Section>

                <Section title="2. Utilisation des données">
                    Vos données sont utilisées pour personnaliser votre expérience, gérer votre compte et vous envoyer des notifications pertinentes. Elles ne sont jamais revendues à des tiers.
                </Section>

                <Section title="3. Sécurité">
                    Nous mettons en œuvre des mesures de sécurité conformes aux standards de l'industrie pour protéger vos informations personnelles contre tout accès non autorisé.
                </Section>

                <Section title="4. Vos droits">
                    Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits en nous contactant ou via les paramètres de l'application.
                </Section>
                <Section title="5. Suppression de compte">
                    Vous pouvez supprimer votre compte et toutes les données associées directement depuis la page Profil {'>'} Paramètres {'>'} Supprimer mon compte.
                </Section>
            </ScrollView>
        </LiquidContainer>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Typo variant="h3" weight="bold" color={Colors.night} style={{ marginBottom: 8 }}>
                {title}
            </Typo>
            <Typo variant="body" color={Colors.textSecondary} style={{ lineHeight: 24 }}>
                {children}
            </Typo>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    paragraph: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    }
});
