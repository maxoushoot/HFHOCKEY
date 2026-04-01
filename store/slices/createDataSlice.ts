import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { StoreState, DataSlice } from '../types';
import { Match } from '../../types/database.types';

export const createDataSlice: StateCreator<StoreState, [], [], DataSlice> = (set, get) => ({
    matches: [],
    teams: [],
    players: [],
    gameEvents: [],

    fetchMatches: async () => {
        set({ isLoading: true });

        // Optimisation : Sélection des champs nécessaires uniquement
        const { data } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:home_team_id (id, slug, name, logo_url, color),
                away_team:away_team_id (id, slug, name, logo_url, color)
            `)
            .order('scheduled_at', { ascending: true });

        if (data) set({ matches: data as unknown as Match[] });
        set({ isLoading: false });
    },

    fetchTeams: async () => {
        const { data } = await supabase.from('teams').select('*');
        if (data) set({ teams: data });
    },

    fetchPlayers: async () => {
        const { data } = await supabase.from('players').select('*');
        if (data) set({ players: data });
    },

    fetchPlayersForMatch: async (homeTeamId: string, awayTeamId: string) => {
        const { data } = await supabase
            .from('players')
            .select('*')
            .in('team_id', [homeTeamId, awayTeamId])
            .order('jersey_number', { ascending: true });

        if (data) set({ players: data });
    },

    fetchGameEvents: async (matchApiId: number) => {
        try {
            const { data, error } = await supabase
                .from('game_events')
                .select('*')
                .eq('match_api_id', matchApiId)
                .order('period', { ascending: true })
                .order('minute', { ascending: true });

            if (error) throw error;
            set({ gameEvents: data || [] });
        } catch (err) {
            console.error('[fetchGameEvents] Error:', err);
            set({ gameEvents: [] });
        }
    },

    triggerSync: async (type = 'full', params?: Record<string, string | number>) => {
        try {
            const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

            let queryString = `?type=${type}`;
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    queryString += `&${key}=${value}`;
                });
            }

            const response = await fetch(
                `${supabaseUrl}/functions/v1/sync-hockey-data${queryString}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const result = await response.json();

            // Auto-refresh local data
            if (result.success && (type === 'full' || type === 'scores')) {
                const { fetchMatches, fetchTeams } = get();
                await fetchTeams();
                await fetchMatches();
            }

            return result;
        } catch (err) {
            console.error('[triggerSync] Error:', err);
            return { success: false, error: String(err) };
        }
    },
});
