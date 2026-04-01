import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LiquidContainer } from '../components/ui/LiquidContainer';
import { Typo } from '../components/ui/Typography';
import { Colors, Layout } from '../constants/Colors';
import { Bell, ArrowLeft, Check, Ticket, Trophy, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

// --- MOCK DATA ---
const NOTIFICATIONS = [
    {
        id: 1,
        type: 'match',
        title: 'Début du match !',
        message: 'Grenoble vs Rouen commence maintenant. Suivez le live !',
        time: 'À l\'instant',
        read: false,
        icon: Trophy,
        color: Colors.gold
    },
    {
        id: 2,
        type: 'ticket',
        title: 'Vos billets sont prêts',
        message: 'Retrouvez vos places pour le match de samedi dans votre portefeuille.',
        time: 'Il y a 2h',
        read: false,
        icon: Ticket,
        color: Colors.electricBlue
    },
    {
        id: 3,
        type: 'info',
        title: 'Mise à jour de l\'application',
        message: 'Découvrez le nouveau design "White Theme" plus épuré.',
        time: 'Hier',
        read: true,
        icon: Info,
        color: Colors.textSecondary
    }
];

export default function NotificationsScreen() {
    const theme = useTheme();
    const [notifs, setNotifs] = useState(NOTIFICATIONS);

    const markAllRead = () => {
        setNotifs(current => current.map(n => ({ ...n, read: true })));
    };

    return (
        <LiquidContainer>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.night} />
                </TouchableOpacity>
                <Typo variant="h3" weight="bold" color={Colors.night}>Notifications</Typo>
                <TouchableOpacity onPress={markAllRead}>
                    <Typo variant="caption" weight="bold" color={theme.primary}>Tout lire</Typo>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {notifs.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.card, !item.read && { backgroundColor: '#F0F9FF' }]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.read ? '#F1F5F9' : Colors.white }]}>
                            <item.icon size={20} color={item.read ? Colors.textSecondary : item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <View style={styles.topRow}>
                                <Typo variant="body" weight="bold" color={Colors.night}>{item.title}</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>{item.time}</Typo>
                            </View>
                            <Typo variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                                {item.message}
                            </Typo>
                        </View>
                        {!item.read && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    content: {
        paddingHorizontal: 24,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.white,
        borderRadius: Layout.radius.xl,
        gap: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    textContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});

