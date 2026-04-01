import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { XPBar } from '../../components/features/XPBar';
import { TrophiesList } from '../../components/features/TrophiesList';
import { Colors } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { Bell, Moon, Shield, HelpCircle, ChevronRight, LogOut, Settings, Star, Trophy, Zap, Edit2, Lock, Sparkles, Crown, Ticket } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { PremiumBadge } from '../../components/ui/PremiumBadge';
import { SubscriptionModal } from '../../components/features/SubscriptionModal';
import { Bounceable } from '../../components/ui/Bounceable';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Écran Profil - Design épuré et moderne.
 */

// Helper to calculate level from XP
const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 500) return 2;
    if (xp < 1000) return 3;
    if (xp < 2500) return 4;
    return 5;
};

const getLevelTitle = (level: number): string => {
    const titles = ['Recrue', 'Fan', 'Supporter', 'Ultra', 'Légende'];
    return titles[level - 1] || 'Recrue';
};

import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { profile, signOut, updateAvatar, achievements } = useStore();
    const { colorMode, toggleColorMode, card, text, subText } = useTheme();
    const [showAvatarModal, setShowAvatarModal] = React.useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
    const [notifEnabled, setNotifEnabled] = React.useState(true); // TODO: Link to store

    const toggleNotif = () => setNotifEnabled(!notifEnabled);

    const level = useMemo(() => calculateLevel(profile?.xp || 0), [profile?.xp]);
    const levelTitle = useMemo(() => getLevelTitle(level), [level]);

    return (
        <LiquidContainer style={{ backgroundColor: colorMode === 'dark' ? Colors.night : undefined }}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Typo variant="h2" weight="black" color={text}>Mon Profil</Typo>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/admin')}
                    >
                        <Settings size={20} color={text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: card }, profile?.is_premium && styles.profileCardPremium]}>
                    <TouchableOpacity style={[styles.avatarContainer, profile?.is_premium && styles.avatarContainerPremium]} onPress={() => setShowAvatarModal(true)}>
                        <Typo style={{ fontSize: 48 }}>{profile?.avatar_url || '🐻'}</Typo>
                        {profile?.is_premium && (
                            <View style={styles.crownBadge}>
                                <Crown size={12} color={Colors.white} fill={Colors.white} />
                            </View>
                        )}
                        <View style={styles.editAvatarBtn}>
                            <Edit2 size={14} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.userInfo}>
                        <Typo variant="h2" weight="black" color={text}>
                            {profile?.username || 'Supporter'}
                        </Typo>
                        <View style={[styles.levelBadge, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate }]}>
                            <Star size={12} color={Colors.gold} fill={Colors.gold} />
                            <Typo variant="caption" weight="bold" color={text}>
                                Niveau {level} • {levelTitle}
                            </Typo>
                        </View>
                    </View>

                    {/* XP Bar */}
                    <XPBar currentXP={profile?.xp || 0} level={level} />

                    <View style={[styles.statsRow, { borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate }]}>
                        <View style={styles.statItem}>
                            <Typo variant="h3" weight="black" color={text}>{profile?.matches_watched || 0}</Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>Matchs</Typo>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate }]} />
                        <View style={styles.statItem}>
                            <Typo variant="h3" weight="black" color={text}>{achievements?.length || 0}</Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>Trophées</Typo>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate }]} />
                        <View style={styles.statItem}>
                            <Typo variant="h3" weight="black" color={text}>#{profile?.rank || '-'}</Typo>
                            <Typo variant="caption" color={Colors.textSecondary}>Rang</Typo>
                        </View>
                    </View>
                </View>

                {/* Premium Banner */}
                {!profile?.is_premium ? (
                    <Bounceable onPress={() => setShowSubscriptionModal(true)}>
                        <LinearGradient
                            colors={['#F59E0B', '#FBBF24']}
                            style={styles.premiumBanner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.premiumGradient}>
                                <View style={styles.premiumIcon}>
                                    <Crown size={24} color={Colors.white} fill={Colors.white} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typo variant="h3" weight="black" color={Colors.white}>Pass Premium</Typo>
                                    <Typo variant="caption" color="rgba(255,255,255,0.9)">Stats avancées, badges exclusifs & sans pubs</Typo>
                                </View>
                                <ChevronRight size={20} color={Colors.white} />
                            </View>
                        </LinearGradient>
                    </Bounceable>
                ) : (
                    <View style={[styles.premiumStatusCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <View style={styles.premiumStatusHeader}>
                            <Crown size={20} color="#D97706" fill="#D97706" />
                            <Typo variant="h4" weight="black" color="#92400E">Membre Premium</Typo>
                        </View>
                        <Typo variant="body" color="#B45309" style={{ fontSize: 13 }}>
                            Vous profitez de tous les avantages exclusifs. Merci de votre soutien ! 🏒
                        </Typo>
                        <View style={styles.premiumBenefitsTags}>
                            <View style={styles.benefitTag}><Typo variant="caption" weight="bold" color="#92400E">Stats Pro</Typo></View>
                            <View style={styles.benefitTag}><Typo variant="caption" weight="bold" color="#92400E">Badges Or</Typo></View>
                            <View style={styles.benefitTag}><Typo variant="caption" weight="bold" color="#92400E">Support Prioritaire</Typo></View>
                        </View>
                    </View>
                )}

                {/* Bets Section */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.settingsCard, { backgroundColor: card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }]}
                        onPress={() => router.push('/profile/bets')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[styles.iconBox, { backgroundColor: Colors.france.blue + '15' }]}>
                                <Ticket size={20} color={Colors.france.blue} />
                            </View>
                            <View>
                                <Typo variant="body" weight="bold" color={text}>Mes Paris</Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>Historique et résultats</Typo>
                            </View>
                        </View>
                        <ChevronRight size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Trophies Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typo variant="h3" weight="black" color={text}>Mes Trophées</Typo>
                        <TouchableOpacity onPress={() => router.push('/trophies')}>
                            <Typo variant="caption" weight="bold" color={Colors.france.blue}>Voir tout</Typo>
                        </TouchableOpacity>
                    </View>
                    <TrophiesList horizontal />
                </View>

                {/* Settings Section */}
                <View style={styles.settingsSection}>
                    <Typo variant="h3" weight="black" color={text} style={{ marginBottom: 16 }}>
                        Paramètres
                    </Typo>

                    <View style={[styles.settingsCard, { backgroundColor: card, borderColor: colorMode === 'dark' ? '#334155' : Colors.slate }]}>
                        <SettingRow
                            icon={Bell}
                            label="Notifications"
                            value={notifEnabled ? "On" : "Off"}
                            onPress={toggleNotif}
                        />
                        <View style={[styles.settingDivider, { backgroundColor: colorMode === 'dark' ? '#334155' : Colors.slate }]} />
                        <SettingRow
                            icon={Moon}
                            label="Apparence"
                            value={colorMode === 'dark' ? "Sombre" : "Clair"}
                            onPress={toggleColorMode}
                        />
                        <View style={[styles.settingDivider, { backgroundColor: colorMode === 'dark' ? '#334155' : Colors.slate }]} />
                        <SettingRow
                            icon={Shield}
                            label="Sécurité"
                            onPress={() => router.push('/settings/security')}
                        />
                        <View style={[styles.settingDivider, { backgroundColor: colorMode === 'dark' ? '#334155' : Colors.slate }]} />
                        <SettingRow
                            icon={HelpCircle}
                            label="Aide & Support"
                            onPress={() => router.push('/settings/help')}
                        />
                    </View>
                </View>
            </ScrollView>

            <SubscriptionModal
                visible={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </LiquidContainer>
    );
}

interface SettingRowProps {
    icon: React.ElementType;
    label: string;
    value?: string;
    onPress: () => void;
}

const SettingRow = React.memo(function SettingRow({ icon: Icon, label, value, onPress }: SettingRowProps) {
    const { text, colorMode } = useTheme();
    return (
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.6} onPress={onPress}>
            <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : Colors.slate }]}>
                    <Icon size={18} color={text} />
                </View>
                <Typo variant="body" weight="bold" color={text}>{label}</Typo>
            </View>
            <View style={styles.rowRight}>
                {value && <Typo variant="caption" color={Colors.textSecondary}>{value}</Typo>}
                <ChevronRight size={18} color={Colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );
});

const SectionTitle = React.memo(({ title }: { title: string }) => (
    <Typo variant="caption" weight="black" color={Colors.textSecondary} style={{ marginBottom: 12, marginTop: 12 }}>
        {title.toUpperCase()}
    </Typo>
));

const AvatarOption = React.memo(({ emoji, selected, locked, onSelect }: { emoji: string, selected: boolean, locked?: boolean, onSelect: () => void }) => (
    <TouchableOpacity
        style={[
            styles.avatarOption,
            selected && styles.avatarOptionSelected,
            locked && styles.avatarOptionLocked
        ]}
        onPress={onSelect}
        activeOpacity={locked ? 1 : 0.7}
    >
        <Typo style={{ fontSize: 32, opacity: locked ? 0.3 : 1 }}>{emoji}</Typo>
        {locked && (
            <View style={styles.lockBadge}>
                <Lock size={12} color={Colors.white} />
            </View>
        )}
    </TouchableOpacity>
));

const styles = StyleSheet.create({
    content: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        marginBottom: 24,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileCard: {
        marginHorizontal: 24,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.slate,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.slate,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.slate,
    },
    section: {
        marginHorizontal: 24,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badgeCard: {
        width: '30%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    badgeLocked: {
        backgroundColor: '#F1F5F9',
        elevation: 0,
    },
    badgeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF9C3', // Light yellow for gold/trophy feel
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    settingsSection: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    settingsCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    settingDivider: {
        height: 1,
        backgroundColor: Colors.slate,
        marginLeft: 58,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.night,
        padding: 18,
        borderRadius: 20,
        marginTop: 16,
    },
    adminIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 24,
        marginTop: 24,
        paddingVertical: 16,
        backgroundColor: '#FEE2E2',
        borderRadius: 20,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: Colors.france.blue,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        width: '80%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarsContainer: {
        width: '100%',
    },
    avatarsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    avatarOption: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    avatarOptionSelected: {
        backgroundColor: Colors.france.blue + '10',
        borderColor: Colors.france.blue,
        borderWidth: 2,
    },
    avatarOptionLocked: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    lockBadge: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: Colors.france.red, // Locked color
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    profileCardPremium: {
        borderColor: '#FCD34D',
        borderWidth: 2,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarContainerPremium: {
        borderColor: '#F59E0B',
        borderWidth: 3,
        backgroundColor: '#FFFBEB',
    },
    crownBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#F59E0B',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    avatarOptionPremium: {
        borderColor: '#FCD34D',
        backgroundColor: '#FFFBEB',
    },
    premiumBadgeSmall: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F59E0B',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.white,
    },
    premiumStatusCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
        overflow: 'hidden',
    },
    premiumStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    premiumBenefitsTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    benefitTag: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    premiumBanner: {
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#D97706",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    premiumGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    premiumIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

