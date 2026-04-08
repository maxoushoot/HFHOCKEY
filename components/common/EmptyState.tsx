import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Typo variant="h4" weight="bold" color={Colors.night}>{title}</Typo>
      {description ? <Typo variant="caption" color={Colors.textSecondary} style={styles.desc}>{description}</Typo> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate,
    alignItems: 'center',
    gap: 8,
  },
  desc: {
    textAlign: 'center',
  },
});
