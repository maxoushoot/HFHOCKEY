import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { syncTSDBTeams, syncTSDBMatches, syncTSDBStandings } from "./sync-thesportsdb.ts";
import { createSupabaseAdmin, getConfig, logSync } from "./utils.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: sync-hockey-data
 * 
 * Orchestrates data synchronization from TheSportsDB.
 * 
 * Query params:
 *   ?type=full       — Full sync: teams → matches → standings
 *   ?type=standings  — Standings only
 *   ?type=status     — Check sync logs + config
 */
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const syncType = url.searchParams.get("type") || "full";

        console.log(`🏒 [sync-hockey-data] Starting sync type: ${syncType} (TheSportsDB Only)`);

        const supabase = createSupabaseAdmin();
        const results: Record<string, any> = { type: syncType, provider: "thesportsdb" };

        const LEAGUE_ID = 4927; // Ligue Magnus (French Ice Hockey)
        const SEASON = "2024-2025";

        switch (syncType) {
            case "full": {
                console.log("👥 Phase 1: Syncing teams...");
                const teamCount = await syncTSDBTeams(LEAGUE_ID, SEASON);
                results.teams = teamCount;

                console.log("🎮 Phase 2: Syncing matches...");
                const matchCount = await syncTSDBMatches(LEAGUE_ID, SEASON);
                results.matches = matchCount;

                console.log("📊 Phase 3: Syncing standings...");
                const standingCount = await syncTSDBStandings(LEAGUE_ID, SEASON);
                results.standings = standingCount;
                break;
            }

            case "standings": {
                console.log("📊 Syncing standings...");
                const standingCount = await syncTSDBStandings(LEAGUE_ID, SEASON);
                results.standings = standingCount;
                break;
            }

            case "status": {
                const { data: config } = await supabase
                    .from("api_sync_config")
                    .select("*");

                const { data: recentLogs } = await supabase
                    .from("api_sync_log")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(10);

                results.config = config;
                results.recentLogs = recentLogs;
                break;
            }

            default:
                throw new Error(`Unknown sync type: ${syncType}. Valid: full, standings, status`);
        }

        console.log(`✅ [sync-hockey-data] Completed: ${syncType}`);

        return new Response(JSON.stringify({ success: true, data: results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(`❌ [sync-hockey-data] Fatal error:`, error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
