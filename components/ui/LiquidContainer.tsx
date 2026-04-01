import React from 'react';
import { StyleSheet, ViewStyle, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface LiquidContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    safeArea?: boolean;
}

/**
 * Container principal de l'application.
 * 
 * Fond blanc simple et épuré.
 */
export function LiquidContainer({
    children,
    style,
    safeArea = true,
}: LiquidContainerProps) {
    const { background, colorMode } = useTheme();

    const content = (
        <View style={[styles.content, style]}>
            {children}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <StatusBar
                barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            {safeArea ? (
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    {content}
                </SafeAreaView>
            ) : content}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor is dynamic now
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    }
});
