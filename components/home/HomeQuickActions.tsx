import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Star, Trophy } from 'lucide-react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { radius, semanticColors, spacing, typographyScale } from '../../constants/theme';

interface HomeQuickActionsProps {
  onFantasyPress: () => void;
}

export function HomeQuickActions({ onFantasyPress }: HomeQuickActionsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
      <TouchableOpacity style={[styles.actionBtn, styles.fantasy]} onPress={onFantasyPress}>
        <View style={styles.actionIcon}>
          <Trophy size={24} color={Colors.white} />
        </View>
        <View>
          <Typo variant="body" weight="black" color={Colors.white}>Fantasy</Typo>
          <Typo variant="caption" color={stylesMeta.lightCaption}>Mon Équipe</Typo>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, styles.bet]} onPress={() => {}}>
        <View style={styles.actionIcon}>
          <Star size={24} color={Colors.white} />
        </View>
        <View>
          <Typo variant="body" weight="black" color={Colors.white}>Paris</Typo>
          <Typo variant="caption" color={stylesMeta.lightCaption}>Cotes & Gains</Typo>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, styles.shop]} onPress={() => {}}>
        <View style={styles.actionIcon}>
          <View style={styles.shopBadge}>
            <Typo variant="caption" weight="black" color={semanticColors.action.accent} style={styles.newLabel}>NEW</Typo>
          </View>
          <Star size={24} color={Colors.white} />
        </View>
        <View>
          <Typo variant="body" weight="black" color={Colors.white}>Boutique</Typo>
          <Typo variant="caption" color={stylesMeta.lightCaption}>Maillots & +</Typo>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const stylesMeta = {
  lightCaption: 'rgba(255,255,255,0.8)',
} as const;

const styles = StyleSheet.create({
  quickActionsScroll: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.lg,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fantasy: {
    backgroundColor: semanticColors.action.primary,
  },
  bet: {
    backgroundColor: semanticColors.action.warning,
  },
  shop: {
    backgroundColor: semanticColors.action.accent,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.white,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm / 2,
  },
  newLabel: {
    fontSize: typographyScale.micro,
  },
});
