import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { Shield, Users, UserCog, Newspaper, BrainCircuit, Bell, Award, RefreshCw } from 'lucide-react-native';
import { TactileButton } from '../../components/ui/TactileButton';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const MENU_ITEMS = [
    { id: 'teams', label: 'Équipes', icon: Shield, color: '#3498db', route: '/admin/teams' },
    { id: 'players', label: 'Joueurs', icon: Users, color: '#e74c3c', route: '/admin/players' },
    { id: 'matches', label: 'Matchs', icon: Shield, color: '#1abc9c', route: '/admin/matches' },
    { id: 'users', label: 'Utilisateurs', icon: UserCog, color: '#9b59b6', route: '/admin/users' },
    { id: 'news', label: 'Actualités', icon: Newspaper, color: '#f1c40f', route: '/admin/news' },
    { id: 'trophies', label: 'Trophées', icon: Award, color: '#EAB308', route: '/admin/trophies' },
    { id: 'academy', label: 'Académie', icon: BrainCircuit, color: '#3B82F6', route: '/admin/academy' },
    { id: 'quizzes', label: 'Quiz', icon: BrainCircuit, color: '#2ecc71', route: '/admin/quizzes' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#e67e22', route: '/admin/notifications' },
    { id: 'sync', label: 'Sync API', icon: RefreshCw, color: '#0EA5E9', route: '/admin/sync' },
];

export default function AdminDashboard() {
    const router = useRouter();
    const { text, card, subText, background, colorMode } = useTheme();
    const isDark = colorMode === 'dark';
    const borderColor = isDark ? '#334155' : '#F1F5F9';

    const [stats, setStats] = useState({ users: 0, matches: 0 });
    const [loading, setLoading] = useState(true);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, matchesRes] = await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
                ]);
                setStats({
                    users: usersRes.count || 0,
                    matches: matchesRes.count || 0,
                });
            } catch (e) {
                console.error('Admin stats error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const sendNotification = () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        Alert.alert('Succès', `Notification "${notifTitle}" envoyée aux utilisateurs !`);
        setNotifTitle('');
        setNotifMessage('');
    };

    return (
        <LiquidContainer style={{ backgroundColor: background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Typo variant="h1" weight="black" color={text}>Admin</Typo>
                    <Typo variant="body" color={subText}>Gérez votre application Hockey France</Typo>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', borderWidth: 1, borderColor }]}>
                        {loading ? (
                            <ActivityIndicator color={Colors.france.blue} />
                        ) : (
                            <Typo variant="h2" weight="black" color={Colors.france.blue}>{stats.users}</Typo>
                        )}
                        <Typo variant="caption" color={isDark ? '#93C5FD' : Colors.france.blue}>Utilisateurs</Typo>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#14532D' : '#F0FDF4', borderWidth: 1, borderColor }]}>
                        {loading ? (
                            <ActivityIndicator color="#16A34A" />
                        ) : (
                            <Typo variant="h2" weight="black" color="#16A34A">{stats.matches}</Typo>
                        )}
                        <Typo variant="caption" color={isDark ? '#86EFAC' : '#16A34A'}>Matchs à venir</Typo>
                    </View>
                </View>

                {/* Quick Notification */}
                <View style={[styles.notifCard, { backgroundColor: card, borderColor }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Bell size={20} color={Colors.france.blue} />
                        <Typo variant="h3" weight="bold" color={text}>Notification Rapide</Typo>
                    </View>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor, color: text }]}
                            placeholder="Titre"
                            placeholderTextColor={subText}
                            value={notifTitle}
                            onChangeText={setNotifTitle}
                        />
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor, color: text }]}
                            placeholder="Message"
                            placeholderTextColor={subText}
                            multiline
                            numberOfLines={3}
                            value={notifMessage}
                            onChangeText={setNotifMessage}
                        />
                    </View>
                    <TouchableOpacity style={styles.sendBtn} onPress={sendNotification}>
                        <Typo variant="body" weight="bold" color={Colors.white}>Envoyer</Typo>
                    </TouchableOpacity>
                </View>

                {/* Main Menu Grid */}
                <View style={styles.grid}>
                    {MENU_ITEMS.map((item) => (
                        <TactileButton
                            key={item.id}
                            style={[styles.card, { backgroundColor: card, borderColor }]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: isDark ? item.color + '20' : item.color + '15' }]}>
                                <item.icon size={32} color={item.color} strokeWidth={2} />
                            </View>
                            <Typo variant="body" weight="bold" color={text} style={{ marginTop: 16 }}>
                                {item.label}
                            </Typo>
                        </TactileButton>
                    ))}
                </View>
            </ScrollView>
        </LiquidContainer>
    );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 16) / 2;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 24,
        paddingBottom: 100,
    },
    header: {
        marginTop: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statBox: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        width: cardWidth,
        height: cardWidth * 1.1,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    notifCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 0,
        borderWidth: 1,
    },
    inputGroup: {
        gap: 12,
        marginBottom: 16,
    },
    input: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        fontFamily: 'Inter-Medium',
    },
    sendBtn: {
        backgroundColor: Colors.france.blue,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

