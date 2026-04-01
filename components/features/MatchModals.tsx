import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { X } from 'lucide-react-native';
import { MVPVote } from '../game/MVPVote';
import { QuizGame } from '../game/QuizGame';

export function VotingModal({ visible, onClose, match, onVoteMVP }: any) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typo variant="h3" weight="black" color={Colors.night}>Vote MVP</Typo>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color={Colors.night} />
                        </TouchableOpacity>
                    </View>
                    <MVPVote homeTeamId={match?.home_team?.id} awayTeamId={match?.away_team?.id} onVote={onVoteMVP} />
                </View>
            </View>
        </Modal>
    );
}

export function QuizModal({ visible, onClose, onScore }: any) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            statusBarTranslucent
        >
            <View style={{ flex: 1, paddingTop: 50 }}>
                <TouchableOpacity
                    style={[styles.closeBtn, { position: 'absolute', top: 50, right: 16, zIndex: 100 }]}
                    onPress={onClose}
                >
                    <X size={20} color={Colors.night} />
                </TouchableOpacity>
                <QuizGame onScore={onScore} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        height: '85%',
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 24,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
