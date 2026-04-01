/**
 * TheSportsDB — HTTP Client
 * 
 * Base URL: https://www.thesportsdb.com/api/v1/json/
 * Auth: API key in URL
 * Method: GET
 */

const API_VERSION = "v1";
const API_BASE = `https://www.thesportsdb.com/api/${API_VERSION}/json`;

/**
 * Make a GET request to TheSportsDB API with retry logic
 */
export async function tsdbGet<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    retries = 3
): Promise<T> {
    const apiKey = Deno.env.get("THESPORTSDB_KEY") || "3"; // '3' is often a valid test key too, '1' is the most common

    const url = new URL(`${API_BASE}/${apiKey}/${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    let lastError: any;

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[TheSportsDB] GET ${url.pathname}${url.search} (attempt ${i + 1}/${retries})`);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "Accept": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`TheSportsDB HTTP ${response.status}: ${response.statusText}`);
            }

            // Buffer the full response text first to avoid truncation
            const text = await response.text();
            console.log(`[TheSportsDB] Response size: ${text.length} bytes`);

            if (!text || text.trim() === "") {
                throw new Error(`TheSportsDB returned empty response for ${endpoint}`);
            }

            let data: T;
            try {
                data = JSON.parse(text) as T;
            } catch (parseErr) {
                console.error(`[TheSportsDB] JSON parse error. First 200 chars: ${text.substring(0, 200)}`);
                throw new Error(`JSON parse failed: ${parseErr}`);
            }

            // TheSportsDB returns null or empty object/array in some cases if not found
            return data;
        } catch (error) {
            console.warn(`[TheSportsDB] Request failed (attempt ${i + 1}): ${error}`);
            lastError = error;

            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}
