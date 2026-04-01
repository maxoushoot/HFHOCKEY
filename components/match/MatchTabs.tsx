import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const TABS = [
    { id: 'summary', label: 'Résumé' },
    { id: 'stats', label: 'Stats' },
    { id: 'lineups', label: 'Compos' },
    { id: 'fanzone', label: 'Fan Zone' },
];

interface MatchTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function MatchTabs({ activeTab, onTabChange }: MatchTabsProps) {
    const activeIndex = TABS.findIndex(t => t.id === activeTab);
    const tabWidth = (Dimensions.get('window').width - 40) / 4; // 40 = paddingHorizontal * 2

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withTiming(activeIndex * tabWidth, { duration: 250 }) }],
        width: tabWidth,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.tabsWrapper}>
                <Animated.View style={[styles.indicator, indicatorStyle]} />
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        style={styles.tab}
                        activeOpacity={0.7}
                    >
                        <Typo
                            variant="caption"
                            weight="bold"
                            color={activeTab === tab.id ? Colors.night : Colors.textSecondary}
                        >
                            {tab.label}
                        </Typo>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    tabsWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.snowSecondary,
        borderRadius: 12,
        height: 44,
        position: 'relative',
        alignItems: 'center',
    },
    indicator: {
        position: 'absolute',
        height: 40,
        backgroundColor: Colors.white,
        borderRadius: 10,
        top: 2,
        left: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 1,
    }
});
