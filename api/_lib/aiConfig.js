import { createClient } from '@supabase/supabase-js';

// Cache the model name in memory for a bit so warm serverless instances
// (Fluid Compute reuses instances) don't hit Supabase on every single request.
const CACHE_TTL_MS = 30_000;
let cachedModel = null;
let cachedAt = 0;

// Admin can change the active AI model from /admin/ai-settings without a redeploy.
// Falls back to the AI_MODEL env var (then a hardcoded default) if the table
// isn't set up yet or the request fails.
export async function getAiModel(fallback) {
  const now = Date.now();
  if (cachedModel && now - cachedAt < CACHE_TTL_MS) {
    return cachedModel;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase.from('ai_settings').select('model').eq('id', 1).single();

    if (data?.model) {
      cachedModel = data.model;
      cachedAt = now;
      return cachedModel;
    }
  } catch {
    // ai_settings table not migrated yet, or Supabase unreachable — use fallback
  }

  return fallback;
}
