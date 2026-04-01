import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Match } from '../types/database.types';
import { generateEvents, generateStats } from '../utils/mockMatchData';

export function useMatchData(id: string) {
    const { matches, fetchGameEvents, triggerSync } = useStore();
    const [localMatch, setLocalMatch] = useState<Match | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [mockEvents, setMockEvents] = useState<any[]>([]);
    const [mockStats, setMockStats] = useState<any>(null);

    const storeMatch = matches.find((m) => m.id === id);
    const match = storeMatch || localMatch;

    useEffect(() => {
        if (!storeMatch && id) {
            const fetchMatch = async () => {
                try {
                    const { data, error } = await supabase
                        .from('matches')
                        .select(`*, home_team:home_team_id(id, name, slug, logo_url, color), away_team:away_team_id(id, name, slug, logo_url, color)`)
                        .eq('id', id)
                        .single();
                    if (error) console.error('[fetchMatch] Error:', error);
                    else if (data) setLocalMatch(data as Match);
                } catch (err) {
                    console.error('[fetchMatch] Exception:', err);
                }
            }
            fetchMatch();
        }
    }, [id, storeMatch]);

    const onRefresh = async () => {
        if (match?.api_id) {
            setRefreshing(true);
            try {
                await triggerSync('scores');
                if (match?.api_id) {
                    await triggerSync('events', { match_id: match.api_id });
                    await fetchGameEvents(match.api_id);
                }
            } catch (e) {
                console.error('[onRefresh] error:', e);
            } finally {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let subscription: any;

        const startPolling = () => {
            if (interval) clearInterval(interval);
            if (match?.status === 'live' && AppState.currentState === 'active') {
                interval = setInterval(() => {
                    console.log(`[MatchDetail] Polling live data for match ${match?.api_id}...`);
                    triggerSync('scores');
                    if (match?.api_id) {
                        triggerSync('events', { match_id: match.api_id })
                            .then(() => fetchGameEvents(match.api_id!));
                    }
                }, 300000);
            }
        };

        const stopPolling = () => {
            if (interval) clearInterval(interval);
        };

        if (match?.api_id) {
            fetchGameEvents(match.api_id);

            if (match.status !== 'scheduled') {
                setMockEvents(generateEvents(match.id, match.home_team_id, match.away_team_id));
                setMockStats(generateStats(match.id));
            }

            if (match.status === 'live') {
                startPolling();
                subscription = AppState.addEventListener('change', nextAppState => {
                    if (nextAppState === 'active') {
                        startPolling();
                    } else {
                        stopPolling();
                    }
                });
            }
        }
        
        return () => {
            stopPolling();
            if (subscription) subscription.remove();
        };
    }, [match?.id, match?.status, match?.api_id]);

    return { match, refreshing, onRefresh, mockEvents, mockStats };
}
