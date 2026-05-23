import { getSupabasePublicConfig } from "@/services/mvpRepository";

export async function upsertSupabaseRows(
  table: string,
  rows: Array<Record<string, unknown>>,
  options: { onConflict?: string } = {},
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const config = getSupabaseWriteConfig();
  const url = new URL(`/rest/v1/${table}`, config.url);

  url.searchParams.set("on_conflict", options.onConflict ?? "id");

  const response = await fetch(url, {
    body: JSON.stringify(rows),
    cache: "no-store",
    headers: {
      ...createSupabaseWriteHeaders(config.key),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(
      `Supabase write failed for ${table}: ${response.status} ${response.statusText} ${detail}`,
    );
  }
}

function getSupabaseWriteConfig(): { key: string; url: string } {
  const publicConfig = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!publicConfig) {
    throw new Error("Supabase URL and publishable key are required.");
  }

  return {
    key: serviceRoleKey || publicConfig.anonKey,
    url: publicConfig.url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, ""),
  };
}

function createSupabaseWriteHeaders(apiKey: string): HeadersInit {
  if (apiKey.startsWith("sb_publishable_")) {
    return { apikey: apiKey };
  }

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}
