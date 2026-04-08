import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { semanticColors, spacing, radius } from '../../constants/theme';

interface HomeHeaderProps {
  onNotificationsPress: () => void;
}

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Typo variant="caption" weight="bold" color={semanticColors.text.secondary}>
          Bienvenue sur
        </Typo>
        <View style={styles.brandRow}>
          <Typo variant="h1" weight="black" color={Colors.france.blue}>Hockey </Typo>
          <Typo variant="h1" weight="black" color={Colors.france.red}>Français</Typo>
        </View>
      </View>
      <TouchableOpacity
        style={styles.notifBtn}
        onPress={onNotificationsPress}
        accessibilityLabel="Voir les notifications"
        accessibilityRole="button"
      >
        <Bell color={Colors.night} size={20} />
        <View style={styles.badge} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md + 2,
    backgroundColor: semanticColors.surface.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: semanticColors.status.error,
  },
});
