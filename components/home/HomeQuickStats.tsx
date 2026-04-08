import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Star, Trophy } from 'lucide-react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { semanticColors, spacing, radius } from '../../constants/theme';

interface HomeQuickStatsProps {
  matchesWatched: number;
  level: number;
}

export function HomeQuickStats({ matchesWatched, level }: HomeQuickStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Trophy size={20} color={Colors.gold} />
        <View>
          <Typo variant="h3" weight="black" color={semanticColors.text.primary}>{matchesWatched}</Typo>
          <Typo variant="caption" color={semanticColors.text.secondary}>Matchs vus</Typo>
        </View>
      </View>
      <View style={styles.statCard}>
        <Star size={20} color={Colors.france.blue} />
        <View>
          <Typo variant="h3" weight="black" color={semanticColors.text.primary}>{level}</Typo>
          <Typo variant="caption" color={semanticColors.text.secondary}>Niveau</Typo>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: semanticColors.surface.card,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semanticColors.border.subtle,
  },
});
