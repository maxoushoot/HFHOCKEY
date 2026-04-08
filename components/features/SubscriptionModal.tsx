import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import { Bounceable } from '../ui/Bounceable';
import { LinearGradient } from 'expo-linear-gradient';
import { useConfetti } from '../../app/_layout';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { ModalBase } from '../ui/ModalBase';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const { explode } = useConfetti();
  const { subscribeToPremium } = useStore(useShallow(state => ({
    subscribeToPremium: state.subscribeToPremium,
  })));
  const [loading, setLoading] = useState(false);

  const features = [
    'Statistiques avancées des joueurs',
    'Pronostics illimités',
    'Badge Premium exclusif',
    'Support prioritaire',
    'Pas de publicités (à venir)',
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    setTimeout(async () => {
      await subscribeToPremium();
      setLoading(false);
      explode();
      onClose();
    }, 1500);
  };

  return (
    <ModalBase visible={visible} onClose={onClose} mode="bottom" blur title="PREMIUM">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={['#FDE68A', '#D97706']} style={styles.iconContainer}>
            <Typo variant="h1" style={styles.crown}>👑</Typo>
          </LinearGradient>
          <Typo variant="h2" weight="black" color={Colors.night} style={styles.headerTitle}>DEVENEZ PREMIUM</Typo>
          <Typo variant="body" color={Colors.textSecondary} style={styles.headerText}>
            Débloquez tout le potentiel de l'application et soutenez le projet !
          </Typo>
        </View>

        <View style={styles.featuresList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check size={14} color={Colors.white} strokeWidth={3} />
              </View>
              <Typo variant="body" color={Colors.night} weight="medium">{feature}</Typo>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <Typo variant="h1" weight="black" color={Colors.night}>Simulation</Typo>
          <Typo variant="body" color={Colors.textSecondary}>Gratuit pour les devs</Typo>
        </View>

        <Bounceable onPress={handleSubscribe} disabled={loading} style={styles.footerBtnWrap}>
          <LinearGradient
            colors={loading ? ['#94a3b8', '#64748b'] : ['#FDE68A', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscribeBtn}
          >
            <Typo variant="h4" weight="black" color={Colors.white}>
              {loading ? 'ACTIVATION...' : 'ACTIVER LE PREMIUM'}
            </Typo>
          </LinearGradient>
        </Bounceable>
      </ScrollView>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  crown: { fontSize: 40 },
  headerTitle: { marginTop: 16 },
  headerText: { textAlign: 'center', marginTop: 8 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  footerBtnWrap: {
    width: '100%',
    marginTop: 16,
  },
  subscribeBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
