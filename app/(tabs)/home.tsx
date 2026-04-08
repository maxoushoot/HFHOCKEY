import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { HeroCard, HeroCardMatch } from '../../components/features/HeroCard';
import { MatchCard } from '../../components/features/MatchCard';
import { NewsCarousel } from '../../components/features/NewsCarousel';
import { TeamStatusWidget } from '../../components/features/TeamStatusWidget';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/Colors';
import { ChevronRight } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { HomeHeader } from '../../components/home/HomeHeader';
import { HomeQuickStats } from '../../components/home/HomeQuickStats';
import { HomeQuickActions } from '../../components/home/HomeQuickActions';
import { semanticColors, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const { matches, fetchMatches, profile, teamId } = useStore(useShallow(state => ({
    matches: state.matches,
    fetchMatches: state.fetchMatches,
    profile: state.profile,
    teamId: state.teamId,
  })));

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const featuredMatch = matches.find((m: any) => m.is_featured);
  const favoriteMatch = teamId
    ? matches.find((m: any) =>
      (m.home_team?.slug === teamId || m.away_team?.slug === teamId)
      && (m.status === 'live' || m.status === 'scheduled'),
    )
    : null;

  const nextMatch = featuredMatch
    || favoriteMatch
    || matches.find((m: any) => m.status === 'live' || m.status === 'scheduled')
    || null;

  return (
    <LiquidContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <HomeHeader onNotificationsPress={() => router.push('/notifications')} />

        <HomeQuickStats
          matchesWatched={profile?.matches_watched || 0}
          level={profile?.level || 1}
        />

        <HomeQuickActions onFantasyPress={() => router.push('/game')} />

        <View style={styles.heroSection}>
          <View style={styles.sectionHeader}>
            <Typo variant="h3" weight="black" color={semanticColors.text.primary}>Prochain Match</Typo>
          </View>
          <HeroCard
            match={nextMatch || ({
              id: 'dummy',
              status: 'scheduled',
              home_team: { name: 'Grenoble', color: '#003399' },
              away_team: { name: 'Rouen', color: '#FFD700' },
            } as unknown as HeroCardMatch)}
          />
        </View>

        <TeamStatusWidget />
        <NewsCarousel />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typo variant="h3" weight="black" color={semanticColors.text.primary}>À l'affiche</Typo>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push('/matches')}
              accessibilityLabel="Voir tous les matchs"
              accessibilityRole="button"
            >
              <Typo variant="caption" weight="bold" color={Colors.france.blue}>Voir tout</Typo>
              <ChevronRight size={16} color={Colors.france.blue} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
            {matches
              .filter((m: any) => m.status === 'live' || m.status === 'scheduled')
              .slice(0, 5)
              .map((match: any) => (
                <View key={match.id} style={styles.matchCardWrap}>
                  <MatchCard match={match} />
                </View>
              ))}
          </ScrollView>
        </View>
      </ScrollView>
    </LiquidContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 160,
  },
  heroSection: {
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchesScroll: {
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  matchCardWrap: {
    width: 280,
  },
});
