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

    voteMVP: async (matchId: string, playerId: string) => {
        const { session, mvpVotes, unlockAchievement } = get();
        const previousState = { ...mvpVotes };

        // Optimistic UI
        set((state) => ({
            mvpVotes: { ...state.mvpVotes, [matchId]: playerId }
        }));
        
        if (!session) return;
        unlockAchievement('2');

        try {
            const { error } = await supabase
                .from('mvp_votes')
                .upsert({ user_id: session.user.id, match_id: matchId, player_id: playerId }, { onConflict: 'user_id, match_id' });
            
            if (error) throw error;
        } catch (err) {
            console.error('Network error during MVP vote. Rolling back...', err);
            set({ mvpVotes: previousState });
            throw err;
        }
    },

    submitPrediction: async (matchId, homeScore, awayScore, winnerId) => {
        const { session, predictions, unlockAchievement } = get();
        if (!session) return;

        const previousState = { ...predictions };

        const prediction: Prediction = {
            user_id: session.user.id,
            match_id: matchId,
            home_score: homeScore,
            away_score: awayScore,
            winner_team_id: winnerId
        };

        // Optimistic UI
        set((state) => ({
            predictions: { ...state.predictions, [matchId]: prediction }
        }));
        unlockAchievement('3');

        try {
            const { error } = await supabase
                .from('predictions')
                .upsert(prediction, { onConflict: 'user_id, match_id' });

            if (error) throw error;
        } catch (err) {
            console.error('Network error during Prediction submission. Rolling back...', err);
            set({ predictions: previousState });
            throw err;
        }
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
        const { session, profile } = get();
        if (!session || !profile) return { success: false, xpGiven: 0, error: 'Non connecté' };

        try {
            // Appel robuste à une fonction RPC "claim_daily_bonus"
            // Cette fonction vérifiera "now()" côté serveur, mettra à jour l'XP et last_daily_bonus_at de manière ACID.
            const { data, error } = await supabase.rpc('claim_daily_bonus', { user_id_param: session.user.id });

            if (error) {
                console.warn('Silent skip - Daily Bonus RPC failed:', error);
                return { success: false, xpGiven: 0, error: 'Non disponible actuellement' };
            }
            
            if (!data?.success) {
                return { success: false, xpGiven: 0, error: data?.error || 'Déjà réclamé aujourd\'hui' };
            }

            const XP_REWARD = data.xp_reward || 50;

            // Update Local State with optimistic UI changes
            // Real source of truth is now handled by the server
            const NOW_ISO = new Date().toISOString(); 
            
            set({
                profile: {
                    ...profile,
                    last_daily_bonus_at: NOW_ISO,
                    xp: (profile.xp || 0) + XP_REWARD
                }
            });

            return { success: true, xpGiven: XP_REWARD };
        } catch (err: any) {
            console.warn('Error claiming bonus gracefully aborted:', err);
            return { success: false, xpGiven: 0, error: err.message || 'Erreur réseau' };
        }
    },
});
