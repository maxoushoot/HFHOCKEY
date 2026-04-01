import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typo } from '../../components/ui/Typography';
import { useTheme } from '../../context/ThemeContext';
import { HelpCircle, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function HelpScreen() {
    const { text, card, colorMode } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.background }]}>
            <Stack.Screen options={{ title: 'Aide & Support', headerTintColor: text, headerStyle: { backgroundColor: colorMode === 'dark' ? Colors.night : Colors.white } }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <HelpCircle size={48} color={Colors.france.blue} />
                    <Typo variant="h2" weight="black" color={text} style={{ marginTop: 16 }}>Besoin d'aide ?</Typo>
                    <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                        Trouvez des réponses ou contactez-nous.
                    </Typo>
                </View>

                <View style={styles.section}>
                    <Typo variant="h3" weight="bold" color={text} style={{ marginBottom: 16 }}>FAQ</Typo>

                    <FaqItem
                        question="Comment gagner de l'XP ?"
                        answer="Vous gagnez de l'XP en validant votre équipe Fantasy League, en faisant des pronostics corrects et en assistant à des matchs."
                    />
                    <FaqItem
                        question="Comment devenir Premium ?"
                        answer="Allez sur votre profil et cliquez sur la bannière Premium pour voir les offres."
                    />
                    <FaqItem
                        question="Puis-je changer mon équipe favorite ?"
                        answer="Oui, allez dans les paramètres ou sur la page d'une équipe et cliquez sur le cœur."
                    />
                </View>

                <View style={styles.section}>
                    <Typo variant="h3" weight="bold" color={text} style={{ marginBottom: 16 }}>Contact</Typo>

                    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]} onPress={() => Linking.openURL('mailto:support@hockey-france.com')}>
                        <View style={styles.iconBox}>
                            <Mail size={24} color={Colors.france.blue} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typo variant="body" weight="bold" color={text}>Email</Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>support@hockey-france.com</Typo>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const { text, card, colorMode } = useTheme();
    const [expanded, setExpanded] = React.useState(false);

    return (
        <TouchableOpacity
            style={[styles.faqItem, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.8}
        >
            <View style={styles.faqHeader}>
                <Typo variant="body" weight="bold" color={text} style={{ flex: 1 }}>{question}</Typo>
                {expanded ? <ChevronUp size={20} color={Colors.textSecondary} /> : <ChevronDown size={20} color={Colors.textSecondary} />}
            </View>
            {expanded && (
                <Typo variant="body" color={Colors.textSecondary} style={{ marginTop: 8 }}>
                    {answer}
                </Typo>
            )}
        </TouchableOpacity>
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
    section: {
        marginBottom: 32,
    },
    faqItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.france.blue + '20', // Opacity 20%
        justifyContent: 'center',
        alignItems: 'center',
    }
});
