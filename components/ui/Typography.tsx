import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

interface TypoProps extends TextProps {
    children: React.ReactNode;
    style?: TextStyle;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
    color?: string;
    weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
}

export function Typo({ children, style, variant = 'body', color, weight, ...props }: TypoProps) {
    const { text } = useTheme();
    const finalColor = color || text;

    let fontSize = 16;
    let fontFamily = 'Inter_400Regular';

    // Variant logic
    switch (variant) {
        case 'h1': fontSize = 32; break;
        case 'h2': fontSize = 24; break;
        case 'h3': fontSize = 20; break;
        case 'h4': fontSize = 18; break;
        case 'body': fontSize = 16; break;
        case 'caption': fontSize = 12; break;
        case 'label': fontSize = 14; break;
    }

    // Weight logic overrides
    if (variant === 'h1' || variant === 'h2') fontFamily = 'Inter_700Bold';

    if (weight) {
        switch (weight) {
            case 'regular': fontFamily = 'Inter_400Regular'; break;
            case 'medium': fontFamily = 'Inter_500Medium'; break;
            case 'semibold': fontFamily = 'Inter_600SemiBold'; break;
            case 'bold': fontFamily = 'Inter_700Bold'; break;
            case 'black': fontFamily = 'Inter_900Black'; break;
        }
    }

    return (
        <Text style={[{ fontFamily, fontSize, color: finalColor }, style]} {...props}>
            {children}
        </Text>
    );
}
