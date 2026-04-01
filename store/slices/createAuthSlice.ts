import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { StoreState, AuthSlice } from '../types';
import { Prediction } from '../../types/database.types';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
    session: null,
    profile: null,
    isAuthenticated: false,
    teamId: 'bdl', // Valeur par défaut
    likedEvents: [],
    votedPollOptionId: null,
    mvpVotes: {},
    predictions: {},
    achievements: [
        { id: '1', icon: '👋', title: 'Bienvenue', description: 'Créez votre compte', unlocked_at: new Date().toISOString() },
        { id: '2', icon: '🗳️', title: 'Premier Vote', description: 'Votez pour un MVP', unlocked_at: undefined },
        { id: '3', icon: '🔮', title: 'Devin', description: 'Faites un pronostic exact', unlocked_at: undefined },
        { id: '4', icon: '🔥', title: 'Supporter', description: 'Assistez à 5 matchs', unlocked_at: undefined },
    ],

    setSession: (session) => set({ session, isAuthenticated: !!session }),

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (data.session) {
            set({ session: data.session, isAuthenticated: true });
            get().fetchProfile(data.user.id);
        }
        return { error };
    },

    signUp: async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) return { error };

        if (data.session) {
            set({ session: data.session, isAuthenticated: true });
            get().fetchProfile(data.user!.id);
        }

        return { error: null };
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, profile: null, isAuthenticated: false });
    },

    fetchProfile: async (userId) => {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: favorites } = await supabase
            .from('user_favorites')
            .select('teams(slug)')
            .eq('user_id', userId)
            .single();

        const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId);

        if (profile) set({ profile });
        if (favorites?.teams) set({ teamId: (favorites.teams as any).slug });

        if (userAchievements && userAchievements.length > 0) {
            set((state) => ({
                achievements: state.achievements.map(a => {
                    const ua = userAchievements.find((u: any) => u.achievement_id === a.id);
                    return ua ? { ...a, unlocked_at: ua.unlocked_at } : a;
                })
            }));
        }
    },

    setFavoriteTeam: async (teamSlug) => {
        const { session, teams } = get();

        // Optimistic update pour les non-connectés ou immédiateté
        set({ teamId: teamSlug });

        if (!session) return;

        const team = teams.find((t) => t.slug === teamSlug);
        if (!team) return;

        const userId = session.user.id;

        try {
            await supabase.from('user_favorites').delete().eq('user_id', userId);
            const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: userId, team_id: team.id });

            if (error) {
                console.error("Erreur lors de la sauvegarde du favori:", error);
            }
        } catch (err) {
            console.error("Exception inattendue:", err);
        }
    },

    updateXP: async (xpToAdd: number) => {
        const { profile, session } = get();
        if (!profile || !session) return;

        const newXP = (profile.xp || 0) + xpToAdd;
        set({ profile: { ...profile, xp: newXP } });

        await supabase
            .from('user_profiles')
            .update({ xp: newXP })
            .eq('id', session.user.id);
    },

    updateAvatar: async (url: string) => {
        const { profile, session } = get();
        if (!profile || !session) return;

        set({ profile: { ...profile, avatar_url: url } });

        await supabase
            .from('user_profiles')
            .update({ avatar_url: url })
            .eq('id', session.user.id);
    },

    subscribeToPremium: async () => {
        const { session, profile } = get();
        if (!session || !profile) return;

        // Simulation d'abonnement (1 an)
        const premiumUntil = new Date();
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

        set({
            profile: {
                ...profile,
                is_premium: true,
                premium_until: premiumUntil.toISOString()
            }
        });

        const { error } = await supabase
            .from('user_profiles')
            .update({
                is_premium: true,
                premium_until: premiumUntil.toISOString()
            })
            .eq('id', session.user.id);

        if (error) {
            console.error("Erreur abonnement Premium:", error);
            // Revert optimistic update
            set({ profile });
        }
    },

    voteMVP: (matchId: string, playerId: string) => {
        const { unlockAchievement } = get();
        set((state) => ({
            mvpVotes: { ...state.mvpVotes, [matchId]: playerId }
        }));
        unlockAchievement('2');
    },

    submitPrediction: (matchId, homeScore, awayScore, winnerId) => {
        const { session, unlockAchievement } = get();
        if (!session) return;

        const prediction: Prediction = {
            user_id: session.user.id,
            match_id: matchId,
            home_score: homeScore,
            away_score: awayScore,
            winner_team_id: winnerId
        };

        set((state) => ({
            predictions: { ...state.predictions, [matchId]: prediction }
        }));

        unlockAchievement('3');
    },

    unlockAchievement: async (achievementId) => {
        const { session, achievements } = get();
        if (!session) return; // Can't persist if not logged in

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked_at) return; // Already unlocked or invalid

        const now = new Date().toISOString();

        // 1. Optimistic Update
        set((state) => ({
            achievements: state.achievements.map(a =>
                a.id === achievementId
                    ? { ...a, unlocked_at: now }
                    : a
            )
        }));

        // 2. Persist to DB
        try {
            const { error } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: session.user.id,
                    achievement_id: achievementId,
                    unlocked_at: now
                });

            if (error) {
                console.error("Error unlocking achievement:", error);
                // Revert optimistic update if needed, but for achievements it's usually fine to retry later
            }
        } catch (err) {
            console.error("Exception unlocking achievement:", err);
        }
    },

    toggleLikeEvent: (eventId: number) => {
        set((state) => {
            const isLiked = state.likedEvents.includes(eventId);
            if (isLiked) {
                return { likedEvents: state.likedEvents.filter(id => id !== eventId) };
            } else {
                return { likedEvents: [...state.likedEvents, eventId] };
            }
        });
    },

    claimDailyBonus: async () => {
        const { session, profile, updateXP } = get();
        if (!session || !profile) return { success: false, xpGiven: 0, error: 'Non connecté' };

        const now = new Date();
        const lastBonus = profile.last_daily_bonus_at ? new Date(profile.last_daily_bonus_at) : null;

        // Check if already claimed today
        if (lastBonus) {
            const isSameDay = lastBonus.getDate() === now.getDate() &&
                lastBonus.getMonth() === now.getMonth() &&
                lastBonus.getFullYear() === now.getFullYear();

            if (isSameDay) {
                return { success: false, xpGiven: 0, error: 'Déjà réclamé aujourd\'hui' };
            }
        }

        const XP_REWARD = 50; // Daily reward amount

        try {
            // Update DB
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    last_daily_bonus_at: now.toISOString(),
                    xp: (profile.xp || 0) + XP_REWARD
                })
                .eq('id', session.user.id);

            if (error) throw error;

            // Update Local State
            set({
                profile: {
                    ...profile,
                    last_daily_bonus_at: now.toISOString(),
                    xp: (profile.xp || 0) + XP_REWARD
                }
            });

            return { success: true, xpGiven: XP_REWARD };
        } catch (err: any) {
            console.error('Error claiming bonus:', err);
            return { success: false, xpGiven: 0, error: err.message };
        }
    },
});
