export interface FantasyTeam {
    id: string;
    user_id: string;
    captain_id: string | null;
    total_points: number;
    budget_remaining: number;
    created_at: string;
    updated_at: string;
}

export interface FantasyTeamPlayer {
    id: string;
    fantasy_team_id: string;
    player_id: string;
}

export interface Team {
    id: string;
    api_id?: number;
    slug: string;
    name: string;
    logo_url: string;
    color: string;
    secondary_color?: string;
}

export interface Player {
    id: string;
    team_id: string;
    name: string;
    jersey_number: number;
    position: string;
    goals: number;
    assists: number;
    matches_played: number;
}

export interface Match {
    id: string;
    api_id?: number;
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    scheduled_at: string;
    status: 'scheduled' | 'live' | 'finished';
    status_short?: string; // API status: NS, P1, P2, P3, OT, PT, FT, AOT, AP...
    status_long?: string;
    venue: string;
    period?: string;
    period_1?: string; // "1-0" format
    period_2?: string;
    period_3?: string;
    overtime?: string;
    penalties?: string;
    league_id?: number;
    season?: number;
    has_events?: boolean;
    stats?: any; // New: JSON stats (shots, faceoffs, etc.)
    home_team?: Team;
    away_team?: Team;
}

export interface GameEvent {
    id: string;
    match_api_id: number;
    period: string;
    minute: string;
    team_api_id?: number;
    team_name?: string;
    player_name?: string;
    assists?: string[];
    event_type: 'goal' | 'penalty';
    comment?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    xp: number;
    level: string; // Stored as string in DB but we might want number in app
    avatar_url: string | null;
    role?: 'admin' | 'user';
    is_premium?: boolean;
    premium_until?: string | null;
    matches_watched?: number;
    rank?: number;
    last_daily_bonus_at?: string | null;
    total_bets?: number;
}

export interface UserBet {
    id: string;
    user_id: string;
    match_id: string;
    amount: number;
    odds: number;
    status: 'pending' | 'won' | 'lost';
    potential_gain: number;
    created_at: string;
}

export interface Prediction {
    user_id: string;
    match_id: string;
    home_score: number;
    away_score: number;
    winner_team_id?: string; // For draw scenarios or just extra data
    points_earned?: number;
}

export interface Achievement {
    id: string;
    icon: string; // lucide icon name or emoji
    title: string;
    description: string;
    unlocked_at?: string; // ISO date if unlocked
}

export interface UserAchievement {
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
}
