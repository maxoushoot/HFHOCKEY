import { tsdbGet } from "./thesportsdb-client.ts";
import { createSupabaseAdmin, logSync } from "./utils.ts";

// TheSportsDB event object for ice hockey
interface TSDBEvent {
    idEvent: string;
    strEvent: string;
    dateEvent: string;
    strTime: string;
    intHomeScore: string | null;
    intAwayScore: string | null;
    idHomeTeam: string;
    idAwayTeam: string;
    strHomeTeam: string;
    strAwayTeam: string;
    strHomeTeamBadge: string;
    strAwayTeamBadge: string;
    strStatus: string; // "FT", "NS", "Not Started", etc.
    strPostponed: string;
    strVenue: string;
}

interface TSDBStanding {
    idTeam: string;
    strTeam: string;
    intPlayed: string;
    intWin: string;
    intLoss: string;
    intOTLoss: string;
    intGoalsFor: string;
    intGoalsAgainst: string;
    intPoints: string;
}

const PROVIDER = "thesportsdb";

/**
 * Sync all Ligue Magnus teams by extracting them from the events feed.
 * TheSportsDB's lookup_all_teams.php doesn't work correctly for this league.
 */
export async function syncTSDBTeams(leagueId: number, season: string): Promise<number> {
    const supabase = createSupabaseAdmin();
    try {
        const response = await tsdbGet<{ events: TSDBEvent[] }>(`eventsseason.php`, { id: leagueId, s: season });
        if (!response.events) return 0;

        // Extract unique teams from events
        const teamsMap = new Map<string, { name: string; badge: string }>();
        for (const event of response.events) {
            if (event.idHomeTeam && event.strHomeTeam) {
                teamsMap.set(event.idHomeTeam, { name: event.strHomeTeam, badge: event.strHomeTeamBadge });
            }
            if (event.idAwayTeam && event.strAwayTeam) {
                teamsMap.set(event.idAwayTeam, { name: event.strAwayTeam, badge: event.strAwayTeamBadge });
            }
        }

        let synced = 0;
        const teamsArray = [];
        for (const [tsdbId, team] of teamsMap) {
            const apiId = parseInt(tsdbId);

            const slug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
            teamsArray.push({
                name: team.name,
                api_id: apiId,
                api_provider: PROVIDER,
                api_logo_url: team.badge,
                country: "France",
                league_id: leagueId,
                slug,
                color: "#1E3A5F",
                logo_url: team.badge,
            });
            synced++;
        }

        if (teamsArray.length > 0) {
            const { error } = await supabase.from("teams").upsert(teamsArray, { onConflict: "api_id" });
            if (error) {
                console.error(`[sync-tsdb-teams] Upsert error:`, error);
                throw error;
            }
        }

        await logSync(supabase, `tsdb-teams`, "success", synced, 1);
        console.log(`[sync-tsdb-teams] Total synced: ${synced}`);
        return synced;
    } catch (error) {
        console.error(`[sync-tsdb-teams] Error:`, error);
        await logSync(supabase, `tsdb-teams`, "error", 0, 1, String(error));
        throw error;
    }
}

/**
 * Sync matches for a league and season using TheSportsDB
 */
export async function syncTSDBMatches(leagueId: number, season: string): Promise<number> {
    const supabase = createSupabaseAdmin();
    try {
        const response = await tsdbGet<{ events: TSDBEvent[] }>(`eventsseason.php`, { id: leagueId, s: season });
        if (!response.events) return 0;

        console.log(`[sync-tsdb-matches] Found ${response.events.length} events`);

        // Map TSDB team IDs to local UUIDs
        const { data: teams } = await supabase
            .from("teams")
            .select("id, api_id")
            .eq("api_provider", PROVIDER);

        const teamMap = new Map<number, string>();
        teams?.forEach((t: { id: string; api_id: number }) => teamMap.set(t.api_id, t.id));

        let synced = 0;
        let skipped = 0;
        const matchesArray = [];
        for (const event of response.events) {
            const homeId = teamMap.get(parseInt(event.idHomeTeam));
            const awayId = teamMap.get(parseInt(event.idAwayTeam));

            if (!homeId || !awayId) {
                skipped++;
                continue;
            }

            const apiId = parseInt(event.idEvent);
            // TheSportsDB time format: "20:30:00+00:00" or "20:30:00"
            const timeStr = event.strTime ? event.strTime.replace(/\+.*$/, "") : "00:00:00";
            const scheduledAt = `${event.dateEvent}T${timeStr}`;

            const isFinished = event.strStatus === "FT" || event.strStatus === "Match Finished";
            const isPostponed = event.strPostponed === "yes";

            matchesArray.push({
                api_id: apiId,
                api_provider: PROVIDER,
                home_team_id: homeId,
                away_team_id: awayId,
                home_score: isFinished && event.intHomeScore ? parseInt(event.intHomeScore) : 0,
                away_score: isFinished && event.intAwayScore ? parseInt(event.intAwayScore) : 0,
                scheduled_at: scheduledAt,
                status: mapTSDBStatus(event.strStatus, isPostponed),
                status_short: event.strStatus === "FT" || event.strStatus === "Match Finished" ? "FT" : "NS",
                venue: event.strVenue || null,
                league_id: leagueId,
                season: parseInt(season.split("-")[0]),
            });
            synced++;
        }

        if (matchesArray.length > 0) {
            const { error } = await supabase.from("matches").upsert(matchesArray, { onConflict: "api_id" });
            if (error) throw error;
        }

        console.log(`[sync-tsdb-matches] Synced: ${synced}, Skipped (team not found): ${skipped}`);
        await logSync(supabase, `tsdb-matches`, "success", synced, 1);
        return synced;
    } catch (error) {
        console.error(`[sync-tsdb-matches] Error:`, error);
        await logSync(supabase, `tsdb-matches`, "error", 0, 1, String(error));
        throw error;
    }
}

/**
 * Sync standings for a league and season using TheSportsDB.
 * Note: TheSportsDB may not provide standings for all leagues on the free tier.
 */
export async function syncTSDBStandings(leagueId: number, season: string): Promise<number> {
    const supabase = createSupabaseAdmin();
    try {
        const response = await tsdbGet<{ table: TSDBStanding[] }>(`lookuptable.php`, { l: leagueId, s: season });
        if (!response.table || response.table.length === 0) {
            console.warn(`[sync-tsdb-standings] No standings available for league ${leagueId} season ${season}`);
            await logSync(supabase, `tsdb-standings`, "partial", 0, 1, "No standings data from TheSportsDB for this season");
            return 0;
        }

        const { data: teams } = await supabase
            .from("teams")
            .select("id, api_id")
            .eq("api_provider", PROVIDER);

        const teamMap = new Map<number, string>();
        teams?.forEach((t: { id: string; api_id: number }) => teamMap.set(t.api_id, t.id));

        // Clear existing standings for TSDB teams then re-insert
        const tsdbTeamIds = [...teamMap.values()];
        if (tsdbTeamIds.length > 0) {
            await supabase.from("standings").delete().in("team_id", tsdbTeamIds);
        }

        let synced = 0;
        const standingsArray = [];
        for (const row of response.table) {
            const teamId = teamMap.get(parseInt(row.idTeam));
            if (!teamId) continue;

            standingsArray.push({
                team_id: teamId,
                played: parseInt(row.intPlayed || "0"),
                wins: parseInt(row.intWin || "0"),
                losses: parseInt(row.intLoss || "0"),
                ot_losses: parseInt(row.intOTLoss || "0"),
                goals_for: parseInt(row.intGoalsFor || "0"),
                goals_against: parseInt(row.intGoalsAgainst || "0"),
                points: parseInt(row.intPoints || "0"),
            });
            synced++;
        }

        if (standingsArray.length > 0) {
            const { error } = await supabase.from("standings").insert(standingsArray);
            if (error) throw error;
        }

        await logSync(supabase, `tsdb-standings`, "success", synced, 1);
        return synced;
    } catch (error) {
        console.error(`[sync-tsdb-standings] Error:`, error);
        await logSync(supabase, `tsdb-standings`, "error", 0, 1, String(error));
        throw error;
    }
}

function mapTSDBStatus(status: string, postponed = false): string {
    if (postponed) return "postponed";
    if (status === "FT" || status === "Match Finished" || status === "AOT" || status === "AP") return "finished";
    if (["P1", "P2", "P3", "OT", "Live"].includes(status)) return "live";
    if (status === "Postponed" || status === "CANC" || status === "Cancelled") return "postponed";
    return "scheduled";
}
