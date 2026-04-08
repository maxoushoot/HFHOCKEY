import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.france.blue} />
      <Typo variant="caption" color={Colors.textSecondary}>{label}</Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
});
