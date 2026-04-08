import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { QuizGame } from '../game/QuizGame';
import { ModalBase } from '../ui/ModalBase';

interface QuizModalProps {
  visible: boolean;
  onClose: () => void;
  onScore: (score: number) => void;
}

export function QuizModal({ visible, onClose, onScore }: QuizModalProps) {
  return (
    <ModalBase visible={visible} onClose={onClose} mode="full" showCloseButton={false}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X size={20} color={Colors.night} />
        </TouchableOpacity>
        <QuizGame onScore={onScore} />
      </View>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 0,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
