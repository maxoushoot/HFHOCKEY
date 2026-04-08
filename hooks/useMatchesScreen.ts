import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';

export type MatchesTabType = 'calendar' | 'teams' | 'players';

export function useMatchesScreen() {
  const [tab, setTab] = useState<MatchesTabType>('calendar');
  const { matches, fetchMatches, isLoading } = useStore(useShallow(state => ({
    matches: state.matches,
    fetchMatches: state.fetchMatches,
    isLoading: state.isLoading,
  })));

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const hasCalendarMatches = useMemo(() => matches.length > 0, [matches.length]);

  return {
    tab,
    setTab,
    matches,
    isLoading,
    hasCalendarMatches,
  };
}
