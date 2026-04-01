import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typo } from './Typography';
import { Colors } from '../../constants/Colors';

interface SectionHeaderProps {
    title: string;
    emoji: string;
}

export function SectionHeader({ title, emoji }: SectionHeaderProps) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
                <Typo style={{ fontSize: 18 }}>{emoji}</Typo>
            </View>
            <Typo variant="h3" weight="black" color={Colors.night}>
                {title}
            </Typo>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
