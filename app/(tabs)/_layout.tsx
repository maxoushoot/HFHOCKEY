import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { TabBar } from '../../components/ui/TabBar';
import { useStore } from '../../store/useStore';
import { DailyBonusModal } from '../../components/features/DailyBonusModal';

/**
 * Layout des Onglets (Tabs Layout).
 * 
 * Barre de navigation épurée et moderne, entièrement refaite avec TabBar custom.
 */
export default function TabLayout() {
    const { profile, claimDailyBonus } = useStore();
    const [showBonus, setShowBonus] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(50); // Default, could be dynamic

    useEffect(() => {
        if (profile) {
            checkBonus();
        }
    }, [profile?.last_daily_bonus_at]);

    const checkBonus = () => {
        if (!profile?.last_daily_bonus_at) {
            setShowBonus(true);
            return;
        }

        const lastBonus = new Date(profile.last_daily_bonus_at);
        const now = new Date();
        const isSameDay = lastBonus.getDate() === now.getDate() &&
            lastBonus.getMonth() === now.getMonth() &&
            lastBonus.getFullYear() === now.getFullYear();

        if (!isSameDay) {
            setShowBonus(true);
        }
    };

    const handleClaim = async () => {
        const { success, xpGiven } = await claimDailyBonus();
        if (success) {
            setBonusAmount(xpGiven); // Ensure UI matches actual given
            setShowBonus(false);
        }
    };

    return (
        <>
            <Tabs
                tabBar={props => <TabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarHideOnKeyboard: true,
                    // The transparency is handled in the custom TabBar
                    tabBarStyle: {
                        position: 'absolute',
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        elevation: 0,
                    }
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Accueil',
                    }}
                />
                <Tabs.Screen
                    name="matches"
                    options={{
                        title: 'Matchs',
                    }}
                />
                <Tabs.Screen
                    name="academy"
                    options={{
                        title: 'Académie',
                    }}
                />
                <Tabs.Screen
                    name="game"
                    options={{
                        title: 'Jeux',
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profil',
                    }}
                />
            </Tabs>

            <DailyBonusModal
                visible={showBonus}
                xpAmount={bonusAmount}
                onClaim={handleClaim}
                onClose={() => setShowBonus(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    tabBarBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    activeIcon: {
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
    },
});

