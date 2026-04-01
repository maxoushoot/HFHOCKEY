import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { BettingHistoryList } from '../../components/features/BettingHistoryList';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BetsScreen() {
    const insets = useSafeAreaInsets();

    return (
        <LiquidContainer>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.night} />
                </TouchableOpacity>
                <Typo variant="h2" weight="black" color={Colors.night}>
                    Mes Paris
                </Typo>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <BettingHistoryList />
            </View>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flex: 1,
    },
});
