import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from './Typography';

interface ModalBaseProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  mode?: 'center' | 'bottom' | 'full';
  blur?: boolean;
  showCloseButton?: boolean;
}

export function ModalBase({
  visible,
  onClose,
  title,
  children,
  mode = 'center',
  blur = false,
  showCloseButton = true,
}: ModalBaseProps) {
  const containerStyle = mode === 'bottom' ? styles.bottomContainer : mode === 'full' ? styles.fullContainer : styles.centerContainer;

  return (
    <Modal visible={visible} transparent animationType={mode === 'bottom' ? 'slide' : 'fade'} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {blur ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[styles.content, containerStyle]}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title ? <Typo variant="h3" weight="black" color={Colors.night}>{title}</Typo> : <View />}
              {showCloseButton ? (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  centerContainer: {
    padding: 24,
  },
  bottomContainer: {
    marginHorizontal: -20,
    marginBottom: -20,
    marginTop: 'auto',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    minHeight: '55%',
  },
  fullContainer: {
    flex: 1,
    marginHorizontal: -20,
    marginVertical: -20,
    borderRadius: 0,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
});
