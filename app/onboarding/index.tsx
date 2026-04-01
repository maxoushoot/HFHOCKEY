import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { TactileButton } from '../../components/ui/TactileButton';
import { Colors, Layout } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TeamGridItem = React.memo(({ team, isSelected, onPress }: { team: any, isSelected: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.cardWrapper}
        >
            <View style={[
                styles.card,
                isSelected && { borderColor: team.color, borderWidth: 3, backgroundColor: Colors.white }
            ]}>
                {/* Team Logo Circle */}
                <View style={[styles.logoCircle, { backgroundColor: team.color }]}>
                    <Typo variant="h2" weight="black" color={Colors.white}>
                        {team.name.charAt(0)}
                    </Typo>
                </View>

                {/* Team Name */}
                <Typo
                    variant="caption"
                    weight="bold"
                    color={Colors.night}
                    numberOfLines={1}
                    style={styles.teamName}
                >
                    {team.name.toUpperCase()}
                </Typo>

                {/* City */}
                <Typo variant="caption" color={Colors.textSecondary}>
                    {team.city}
                </Typo>

                {/* Selected Check */}
                {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: team.color }]}>
                        <Check size={14} color={Colors.white} strokeWidth={3} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}, (prev, next) => prev.isSelected === next.isSelected && prev.team.id === next.team.id);

export default function OnboardingScreen() {
    const [selectedTeamSlug, setSelectedTeamSlug] = useState<string | null>(null);
    const { setFavoriteTeam, teams, fetchTeams } = useStore();

    useEffect(() => {
        fetchTeams();
    }, []);

    const selectedTeam = teams.find((t: any) => t.slug === selectedTeamSlug);

    const handleValidation = async () => {
        if (selectedTeamSlug) {
            await setFavoriteTeam(selectedTeamSlug);
            router.replace('/(tabs)/home');
        }
    };

    return (
        <LiquidContainer>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                {/* Logo */}
                <Image
                    source={require('../../assets/images/logo-hf.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.stepBadge}>
                    <Typo variant="caption" weight="bold" color={Colors.france.blue}>
                        ÉTAPE 2/2
                    </Typo>
                </View>
                <Typo variant="h1" weight="black" color={Colors.night}>
                    Choisis ton camp
                </Typo>
                <Typo variant="body" color={Colors.textSecondary} style={styles.subtitle}>
                    Ta couleur, ton équipe, ta passion.
                </Typo>
            </View>

            {/* Teams Grid */}
            <View style={styles.gridContainer}>
                <FlatList
                    data={teams}
                    renderItem={({ item }: any) => (
                        <TeamGridItem
                            team={item}
                            isSelected={selectedTeamSlug === item.slug}
                            onPress={() => setSelectedTeamSlug(item.slug)}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TactileButton
                    onPress={handleValidation}
                    style={[
                        styles.button,
                        {
                            backgroundColor: selectedTeam ? selectedTeam.color : Colors.slate,
                        }
                    ]}
                    disabled={!selectedTeam}
                >
                    <Typo weight="black" color={selectedTeam ? Colors.white : Colors.textSecondary}>
                        {selectedTeam
                            ? `REJOINDRE ${selectedTeam.name.toUpperCase()}`
                            : 'SÉLECTIONNE UNE ÉQUIPE'
                        }
                    </Typo>
                </TactileButton>
            </View>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 24,
        paddingTop: 20,
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: width * 0.3,
        height: width * 0.18,
        marginBottom: 8,
    },
    stepBadge: {
        backgroundColor: Colors.france.blue + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
    },
    gridContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    grid: {
        paddingBottom: 140,
    },
    cardWrapper: {
        width: '50%',
        padding: 6,
    },
    card: {
        aspectRatio: 0.9,
        backgroundColor: Colors.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    logoCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamName: {
        textAlign: 'center',
        marginBottom: 4,
    },
    checkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Colors.white,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
});
