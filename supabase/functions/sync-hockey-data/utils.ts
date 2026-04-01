import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create a Supabase admin client (service_role) for Edge Functions
 */
export function createSupabaseAdmin() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Map API-Sports status codes to app status
 */
export function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
    const LIVE_STATUSES = ["P1", "P2", "P3", "OT", "PT", "BT"];
    const FINISHED_STATUSES = ["FT", "AOT", "AP", "AW"];

    if (LIVE_STATUSES.includes(apiStatus)) return "live";
    if (FINISHED_STATUSES.includes(apiStatus)) return "finished";
    return "scheduled"; // NS, POST, CANC, INTR, ABD
}

/**
 * Map API-Sports period to human-readable French
 */
export function mapPeriod(period: string): string {
    const MAP: Record<string, string> = {
        P1: "1ère période",
        P2: "2ème période",
        P3: "3ème période",
        OT: "Prolongations",
        PT: "Tirs au but",
        BT: "Pause",
    };
    return MAP[period] || period;
}

/**
 * Log a sync operation to the database
 */
export async function logSync(
    supabase: ReturnType<typeof createSupabaseAdmin>,
    syncType: string,
    status: "success" | "error" | "partial",
    recordsSynced: number,
    requestsUsed: number,
    errorMessage?: string
) {
    await supabase.from("api_sync_log").insert({
        sync_type: syncType,
        status,
        records_synced: recordsSynced,
        requests_used: requestsUsed,
        error_message: errorMessage || null,
    });
}

/**
 * Get a config value from api_sync_config
 */
export async function getConfig(
    supabase: ReturnType<typeof createSupabaseAdmin>,
    key: string
): Promise<string | null> {
    const { data } = await supabase
        .from("api_sync_config")
        .select("value")
        .eq("key", key)
        .single();
    return data?.value || null;
}

/**
 * Set a config value in api_sync_config
 */
export async function setConfig(
    supabase: ReturnType<typeof createSupabaseAdmin>,
    key: string,
    value: string
) {
    await supabase.from("api_sync_config").upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
    );
}

/**
 * Get current hockey season (based on date — season starts in Sep)
 */
export function getCurrentSeason(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-indexed
    // Hockey season typically starts in September
    // If we're in Jan-Jul, the season started last year
    return month >= 8 ? year : year - 1;
}
