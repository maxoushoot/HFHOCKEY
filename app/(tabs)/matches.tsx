import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { StandingsTable } from '../../components/features/StandingsTable';
import { PlayersStandings } from '../../components/features/PlayersStandings';
import { Colors } from '../../constants/Colors';
import { MatchCard } from '../../components/features/MatchCard';
import { useTeamTheme } from '../../hooks/useTeamTheme';
import { Calendar, Trophy, Users } from 'lucide-react-native';
import { MatchListSkeleton } from '../../components/features/MatchListSkeleton';
import { useTheme } from '../../context/ThemeContext';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { MatchesTabType, useMatchesScreen } from '../../hooks/useMatchesScreen';

type TabConfig = { id: MatchesTabType; label: string; icon: React.ElementType };

const TABS: TabConfig[] = [
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'teams', label: 'Équipes', icon: Trophy },
  { id: 'players', label: 'Joueurs', icon: Users },
];

export default function MatchesScreen() {
  const { tab, setTab, matches, isLoading, hasCalendarMatches } = useMatchesScreen();
  const { primary } = useTeamTheme();
  const { colorMode } = useTheme();

  return (
    <LiquidContainer>
      <View style={styles.header}>
        <View>
          <Typo variant="h1" weight="black" color={Colors.night}>COMPÉTITION</Typo>
          <Typo variant="caption" color={Colors.textSecondary}>Ligue Magnus 2025-2026</Typo>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedTabs
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          activeColor={primary}
          backgroundColor={colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : Colors.slate}
          textColor={colorMode === 'dark' ? Colors.white : Colors.textSecondary}
        />
      </View>

      <View style={styles.flexOne}>
        {tab === 'calendar' ? (
          isLoading ? (
            <ScrollView contentContainerStyle={styles.content}>
              <MatchListSkeleton />
            </ScrollView>
          ) : hasCalendarMatches ? (
            <FlashList
              data={matches}
              renderItem={({ item }: { item: typeof matches[0] }) => (
                <View style={styles.matchItem}>
                  <MatchCard match={item} />
                </View>
              )}
              estimatedItemSize={140}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.content}>
              <EmptyState title="Aucun match disponible" description="Les rencontres apparaîtront ici dès qu'elles seront publiées." />
            </View>
          )
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {tab === 'teams' && <StandingsTable />}
            {tab === 'players' && <PlayersStandings />}
          </ScrollView>
        )}
      </View>
    </LiquidContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  flexOne: {
    flex: 1,
  },
  matchItem: {
    marginBottom: 16,
  },
});
