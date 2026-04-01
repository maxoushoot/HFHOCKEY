import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Colors, getTeamColor, getTeamGradient } from '../constants/Colors';

/**
 * Hook pour récupérer le thème dynamique basé sur l'équipe favorite.
 * 
 * Retourne les couleurs de l'équipe favorite de l'utilisateur,
 * avec fallback sur le thème France si aucune équipe n'est sélectionnée.
 * 
 * @example
 * const { primary, gradient, accentLight } = useTeamTheme();
 * // Utiliser primary comme couleur d'accent principale
 */
export function useTeamTheme() {
    const { teamId } = useStore();

    return useMemo(() => {
        const primary = getTeamColor(teamId);
        const gradient = getTeamGradient(teamId);

        // Calculer une version plus claire pour les backgrounds
        const accentLight = `${primary}15`; // 15% opacity
        const accentMedium = `${primary}30`; // 30% opacity

        // Déterminer si la couleur est sombre (pour le contraste texte)
        const isDark = isColorDark(primary);
        const textOnPrimary = isDark ? Colors.white : Colors.night;

        return {
            // Couleur principale de l'équipe
            primary,

            // Gradient pour les headers et heroes
            gradient: gradient as unknown as [string, string, ...string[]],
            heroGradient: [primary, `${primary}DD`, Colors.night] as unknown as [string, string, ...string[]],

            // Versions avec opacité pour les fonds
            accentLight,
            accentMedium,

            // Couleur du texte sur fond primary
            textOnPrimary,

            // France comme fallback/secondaire
            france: Colors.france,

            // ID de l'équipe pour les conditionals
            teamId,

            // Couleurs sémantiques (passthrough)
            colors: Colors,
        };
    }, [teamId]);
}

/**
 * Détermine si une couleur hexadécimale est sombre.
 * Utilisé pour choisir le contraste du texte.
 */
function isColorDark(hex: string): boolean {
    // Enlever le # si présent
    const color = hex.replace('#', '');

    // Convertir en RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calcul de luminosité (formule WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
}

/**
 * Hook simplifié pour obtenir juste la couleur primaire
 */
export function useTeamColor(): string {
    const { teamId } = useStore();
    return getTeamColor(teamId);
}
