import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const API_SPORTS_KEY = Deno.env.get('API_SPORTS_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const LEAGUE_ID = 56; // Ligue Magnus
const SEASON = 2025;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── SAFEGUARD: Track last sync time in-memory to prevent runaway calls ───
let lastSyncTimestamp = 0;
const MIN_INTERVAL_MS = 55_000; // Minimum 55 seconds between syncs

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // ─── SAFEGUARD 1: Reject if API key is not configured ───
    if (!API_SPORTS_KEY || API_SPORTS_KEY === 'XxXxXxXxXxXxXxXxXxXxXxXx') {
        console.warn("ABORT: API_SPORTS_KEY is not set or is a placeholder. Skipping sync.");
        return new Response(JSON.stringify({
            skipped: true,
            reason: "API_SPORTS_KEY not configured. Set it in Supabase Secrets."
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    // ─── SAFEGUARD 2: Rate limit — prevent calls faster than every 55s ───
    const now = Date.now();
    if (now - lastSyncTimestamp < MIN_INTERVAL_MS) {
        console.warn(`ABORT: Called too soon. Last sync was ${Math.round((now - lastSyncTimestamp) / 1000)}s ago.`);
        return new Response(JSON.stringify({
            skipped: true,
            reason: "Rate limited. Try again later."
        }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
    lastSyncTimestamp = now;

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const apiHeaders: Record<string, string> = {
        'x-apisports-key': API_SPORTS_KEY,
    };

    try {
        console.log("Starting API-Sports Sync...");

        // ─── SAFEGUARD 3: Check API quota before doing anything ───
        const statusRes = await fetch("https://v1.hockey.api-sports.io/status", { headers: apiHeaders });
        if (!statusRes.ok) {
            throw new Error(`API-Sports /status check failed: ${statusRes.status} ${statusRes.statusText}`);
        }
        const statusData = await statusRes.json();
        const subscription = statusData.response?.subscription;
        const requests = statusData.response?.requests;

        if (!subscription?.active) {
            console.error("ABORT: API-Sports subscription is not active!");
            return new Response(JSON.stringify({
                skipped: true,
                reason: "API-Sports subscription inactive or suspended."
            }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const remaining = (requests?.limit_day || 100) - (requests?.current || 0);
        console.log(`API Quota: ${requests?.current}/${requests?.limit_day} used, ${remaining} remaining.`);

        // ─── SAFEGUARD 4: Stop if less than 10% daily quota remaining ───
        if (remaining < Math.ceil((requests?.limit_day || 100) * 0.10)) {
            console.warn(`ABORT: Quota low — only ${remaining} requests left. Stopping to prevent suspension.`);
            return new Response(JSON.stringify({
                skipped: true,
                reason: `Quota low: ${remaining} requests remaining.`
            }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // ─── Fetch today's games ───
        const today = new Date().toISOString().split('T')[0];
        const gamesRes = await fetch(
            `https://v1.hockey.api-sports.io/games?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`,
            { headers: apiHeaders }
        );

        if (!gamesRes.ok) throw new Error(`API-Sports /games failed: ${gamesRes.statusText}`);

        const gamesData = await gamesRes.json();
        if (gamesData.errors && Object.keys(gamesData.errors).length > 0) {
            console.error("API Error on /games:", gamesData.errors);
            return new Response(JSON.stringify({ error: gamesData.errors }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const games = gamesData.response || [];
        console.log(`Fetched ${games.length} games for ${today}.`);

        let gamesUpserted = 0;
        let eventsUpserted = 0;

        for (const game of games) {
            const { data: homeTeam } = await supabase
                .from('teams').select('id').eq('api_id', game.teams.home.id).single();
            const { data: awayTeam } = await supabase
                .from('teams').select('id').eq('api_id', game.teams.away.id).single();

            if (!homeTeam || !awayTeam) {
                console.warn(`Skipping game ${game.id}: teams not found locally (Home API:${game.teams.home.id}, Away API:${game.teams.away.id})`);
                continue;
            }

            const statusShort = game.status?.short || 'NS';
            const isLive = ['P1', 'P2', 'P3', 'OT', 'PT', 'BT'].includes(statusShort);
            const isFinished = ['FT', 'AOT', 'AP', 'AW'].includes(statusShort);

            const matchPayload = {
                api_id: game.id,
                api_provider: 'api-sports',
                league_id: LEAGUE_ID,
                season: SEASON,
                home_team_id: homeTeam.id,
                away_team_id: awayTeam.id,
                status: isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
                status_short: statusShort,
                status_long: game.status?.long || null,
                scheduled_at: game.date,
                home_score: game.scores?.home ?? 0,
                away_score: game.scores?.away ?? 0,
                period_1: game.periods?.first || null,
                period_2: game.periods?.second || null,
                period_3: game.periods?.third || null,
                overtime: game.periods?.overtime || null,
                penalties: game.periods?.penalties || null,
                period: statusShort,
                has_events: game.events || false,
            };

            const { error: matchError } = await supabase
                .from('matches')
                .upsert(matchPayload, { onConflict: 'api_id' });

            if (matchError) {
                console.error(`Error upserting match ${game.id}:`, matchError);
            } else {
                gamesUpserted++;
            }

            // Only fetch events for live or recently finished games that have events
            if (game.events && (isLive || isFinished)) {
                const count = await syncGameEvents(game.id, apiHeaders, supabase);
                eventsUpserted += count;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            date: today,
            games_fetched: games.length,
            games_upserted: gamesUpserted,
            events_synced: eventsUpserted,
            quota_remaining: remaining - 1 - games.filter((g: any) => g.events).length,
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Sync Error:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});

// ─── Sync events for a single game ───
async function syncGameEvents(
    matchApiId: number,
    headers: Record<string, string>,
    supabase: ReturnType<typeof createClient>
): Promise<number> {
    try {
        const eventsRes = await fetch(
            `https://v1.hockey.api-sports.io/games/events?game=${matchApiId}`,
            { headers }
        );
        if (!eventsRes.ok) return 0;

        const eventsData = await eventsRes.json();
        const events = eventsData.response || [];
        if (events.length === 0) return 0;

        // Clear old events for this game, then insert fresh ones
        await supabase.from('game_events').delete().eq('match_api_id', matchApiId);

        const mappedEvents = events.map((ev: any) => ({
            match_api_id: matchApiId,
            period: ev.period,
            minute: ev.minute?.toString(),
            team_api_id: ev.team?.id,
            team_name: ev.team?.name,
            player_name: ev.player?.name,
            assists: [ev.assist_1, ev.assist_2].filter(Boolean),
            event_type: ev.type,
            comment: ev.comment || ev.detail || null,
        }));

        const { error } = await supabase.from('game_events').insert(mappedEvents);
        if (error) {
            console.error(`Error inserting events for match ${matchApiId}:`, error);
            return 0;
        }
        return mappedEvents.length;
    } catch (e) {
        console.error(`Exception syncing events for ${matchApiId}:`, e);
        return 0;
    }
}
