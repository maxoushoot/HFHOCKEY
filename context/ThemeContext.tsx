import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Colors } from '../constants/Colors';

interface Theme {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    subText: string;
    white: string;
    name: string;
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
}

const DEFAULT_THEME: Theme = {
    primary: Colors.electricBlue,
    secondary: Colors.night,
    background: Colors.snow, // Light BG
    card: Colors.white,      // Light Card
    text: Colors.night,      // Dark Text
    subText: Colors.textSecondary,
    white: Colors.white,
    name: 'Default',
    colorMode: 'light',
    toggleColorMode: () => { }
};

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { teamId, teams } = useStore(); // Get loaded teams from Supabase store
    const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

    const toggleColorMode = () => {
        setColorMode(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        // Find team by slug (teamId in store is key)
        const teamData = teams.find((t: any) => t.slug === teamId);
        const constantColor = Colors.teams[teamId as keyof typeof Colors.teams];

        // Ensure we respect the mode when generating colors
        // For now, we mainly update the context values. 
        // Real dark mode implementation would require swapping all Colors.* calls in the app to use theme.*
        // But we can start by exposing the mode.

        let newTheme = { ...DEFAULT_THEME };

        if (colorMode === 'dark') {
            newTheme = {
                ...newTheme,
                background: Colors.night,
                card: '#1e293b',
                text: Colors.white,
                subText: '#94a3b8',
                white: Colors.night, // Inverting white/night for basic semantic semantic
            };
        }

        if (constantColor) {
            newTheme.primary = constantColor;
            newTheme.name = teamData?.name || teamId?.toUpperCase();
        } else if (teamData && teamData.color) {
            newTheme.primary = teamData.color;
            newTheme.name = teamData.name;
        }

        setTheme(newTheme);

    }, [teamId, teams, colorMode]);

    return (
        <ThemeContext.Provider value={{ ...theme, toggleColorMode, colorMode } as any}>
            {children}
        </ThemeContext.Provider>
    );
};
