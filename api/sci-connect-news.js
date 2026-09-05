// Serves the SCI Connect news list from the `external_news` Supabase table
// instead of scraping sci.pnru.ac.th on every visit — the sync-sci-news Edge
// Function (supabase/functions/sync-sci-news) keeps that table up to date on
// a cron, so this endpoint just reads it.
import { createClient } from '@supabase/supabase-js';

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 15;

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing');
  return createClient(url, key);
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const requestedLimit = parseInt(url.searchParams.get('limit'), 10);
      const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('external_news')
        .select('slug, title, description, image_url, published_text, detail_url')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;

      const news = (data || []).map((row) => ({
        slug: row.slug,
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        published_date: row.published_text,
        detail_url: row.detail_url,
      }));

      return Response.json({ news });
    } catch (err) {
      console.error('[sci-connect-news]', err);
      return Response.json({ error: 'ไม่สามารถดึงข่าวจาก SCI Connect ได้ในขณะนี้' }, { status: 502 });
    }
  },
};
