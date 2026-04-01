/**
 * Système de Couleurs (Design Tokens) - Thème France 🇫🇷
 * 
 * Ce fichier centralise toutes les couleurs de l'application.
 * Le thème est basé sur les couleurs du drapeau français avec
 * des accents dynamiques selon l'équipe favorite de l'utilisateur.
 */

export const Colors = {
    // --- THÈME FRANCE 🇫🇷 ---
    france: {
        blue: '#002395',      // Bleu France
        white: '#FFFFFF',     // Blanc
        red: '#ED2939',       // Rouge France
        blueLight: '#0055CC', // Bleu plus clair (accents)
        blueDark: '#001A6E',  // Bleu foncé (headers)
    },

    // --- FONDATIONS (Couleurs de base) ---
    snow: '#FFFFFF',          // Blanc Pur
    snowSecondary: '#F8FAFC', // Blanc légèrement teinté
    night: '#0F172A',         // Bleu Nuit profond (texte principal)
    slate: '#F1F5F9',         // Gris très clair (Slate 100)
    white: '#FFFFFF',
    background: '#FFFFFF',

    // --- ACCENTS ---
    primary: '#002395',        // Bleu France comme couleur primaire
    electricBlue: '#0055CC',
    alertRed: '#ED2939',       // Rouge France
    gold: '#CA8A04',
    goldGradient: ['#FDB931', '#FFFFAC', '#D1B464'],

    // --- ÉQUIPES (Couleurs de marque - Ligue Magnus) ---
    teams: {
        bdl: '#003399',       // Grenoble (Brûleurs de Loups) - Bleu Roi
        rouen: '#FECE00',     // Rouen (Dragons) - Jaune
        angers: '#E30613',    // Angers (Ducs) - Rouge
        gap: '#004C97',       // Gap (Rapaces) - Bleu
        briancon: '#D6001C',  // Briançon (Diables Rouges) - Rouge
        chamonix: '#FFD700',  // Chamonix (Pionniers) - Or
        cergy: '#3BB54A',     // Cergy (Jokers) - Vert
        amiens: '#DA291C',    // Amiens (Gothiques) - Rouge
        nice: '#000000',      // Nice (Aigles) - Noir
        bordeaux: '#7C191E',  // Bordeaux (Boxers) - Bordeaux
        marseille: '#004899', // Marseille (Spartiates) - Bleu
        anglet: '#006135',    // Anglet (Hormadi) - Vert
    } as Record<string, string>,

    // --- SÉMANTIQUE ---
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textLight: '#FFFFFF',

    // --- SURFACES ---
    cardBg: '#FFFFFF',
    cardBorder: '#E2E8F0',
    glassLight: 'rgba(255, 255, 255, 0.95)',
    glassDark: 'rgba(15, 23, 42, 0.05)',

    // --- ÉTATS ---
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
};

/**
 * Styles de cartes cohérents (Fan Zone style)
 */
export const CardStyles = {
    base: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    small: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    }
};

/**
 * Layout Tokens
 */
export const Layout = {
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        full: 9999,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    shadows: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        glow: {
            shadowColor: Colors.france.blue,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        }
    }
};

/**
 * Helper pour obtenir la couleur d'une équipe
 */
export function getTeamColor(teamId: string): string {
    return Colors.teams[teamId] || Colors.france.blue;
}

/**
 * Helper pour créer un gradient d'équipe
 */
export function getTeamGradient(teamId: string): string[] {
    const color = getTeamColor(teamId);
    return [color, `${color}CC`, `${color}99`];
}

/**
 * Gradient France par défaut
 */
export const FranceGradient = [Colors.france.blue, Colors.france.blue + 'DD'];
export const FranceHeroGradient = [
    Colors.france.blue,
    Colors.france.blueDark,
    '#0A1628'
];
