import { Session } from '@supabase/supabase-js';
import { UserProfile, Team, Player, Match, GameEvent, Prediction, Achievement } from '../types/database.types';

export interface AuthSlice {
    session: Session | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;
    teamId: string;
    likedEvents: number[];
    votedPollOptionId: string | null;
    mvpVotes: Record<string, string>;
    predictions: Record<string, Prediction>;
    achievements: Achievement[];

    setSession: (session: Session | null) => void;
    signIn: (email: string, pass: string) => Promise<{ error: any }>;
    signUp: (email: string, pass: string, username: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
    setFavoriteTeam: (teamSlug: string) => Promise<void>;
    updateXP: (xpToAdd: number) => Promise<void>;
    updateAvatar: (url: string) => Promise<void>;
    voteMVP: (matchId: string, playerId: string) => void;
    submitPrediction: (matchId: string, homeScore: number, awayScore: number, winnerId?: string) => void;
    unlockAchievement: (achievementId: string) => void;
    toggleLikeEvent: (eventId: number) => void;
    subscribeToPremium: () => Promise<void>;
    claimDailyBonus: () => Promise<{ success: boolean; xpGiven: number; error?: string }>;
}

export interface DataSlice {
    matches: Match[];
    teams: Team[];
    players: Player[];
    gameEvents: GameEvent[];

    fetchMatches: () => Promise<void>;
    fetchTeams: () => Promise<void>;
    fetchPlayers: () => Promise<void>;
    fetchPlayersForMatch: (homeTeamId: string, awayTeamId: string) => Promise<void>;
    fetchGameEvents: (matchApiId: number) => Promise<void>;
    triggerSync: (
        type?: 'full' | 'scores' | 'events' | 'standings' | 'status',
        params?: Record<string, string | number>
    ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export interface UISlice {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export type StoreState = AuthSlice & DataSlice & UISlice;
