import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';

interface MatchActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colors: [string, string, ...string[]];
  onPress: () => void;
  rightElement?: React.ReactNode;
  style?: object;
}

export function MatchActionCard({
  title,
  subtitle,
  icon,
  colors,
  onPress,
  rightElement,
  style,
}: MatchActionCardProps) {
  return (
    <TouchableOpacity style={[styles.actionCard, style]} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={colors} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Typo variant="h3" weight="black" color={Colors.white}>{title}</Typo>
          <Typo variant="caption" color="rgba(255,255,255,0.75)">{subtitle}</Typo>
        </View>
        {rightElement ?? (
          <View style={styles.arrowContainer}>
            <ArrowRight size={20} color={Colors.white} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    marginTop: 14,
  },
  actionGradient: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
