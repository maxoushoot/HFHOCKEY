
import React, { memo } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const TermsOfService = memo(() => {
    const router = useRouter();

    return (
        <LiquidContainer>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={Colors.night} size={24} />
                </TouchableOpacity>
                <Typo variant="h3" weight="black" color={Colors.night}>CGU</Typo>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Typo variant="h2" weight="bold" color={Colors.night} style={{ marginBottom: 16 }}>
                    Conditions Générales d'Utilisation
                </Typo>
                <Typo variant="body" color={Colors.textSecondary} style={styles.paragraph}>
                    En utilisant l'application Hockey France, vous acceptez les présentes conditions.
                </Typo>

                <Section title="1. Usage personnel">
                    L'application est destinée à un usage personnel et non commercial. Vous vous engagez à ne pas utiliser l'application à des fins illégales ou nuisibles.
                </Section>

                <Section title="2. Contenu utilisateur">
                    Vous êtes responsable du contenu que vous publiez (commentaires, réactions). Tout contenu haineux ou inapproprié sera supprimé et pourra entraîner la suspension de votre compte.
                </Section>

                <Section title="3. Propriété intellectuelle">
                    Tous les éléments de l'application (logos, textes, images) sont la propriété exclusive de Hockey France ou de ses partenaires.
                </Section>

                <Section title="4. Limitation de responsabilité">
                    Nous ne saurions être tenus responsables des erreurs, interruptions ou perte de données liées à l'utilisation de l'application.
                </Section>
            </ScrollView>
        </LiquidContainer>
    );
});

export default TermsOfService;

const Section = memo(({ title, children }: { title: string, children: React.ReactNode }) => {
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
});

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
