// Serves one SCI Connect news detail from the `external_news` Supabase table
// instead of scraping sci.pnru.ac.th on every visit — sync-sci-news fetches
// each new item's detail page once (title/description/facebook_url) and
// stores it, so this endpoint just reads it back by slug.
//
// Note: only items still in the table (the 15 newest, per sync-sci-news'
// pruning) resolve here — an older slug that's aged out returns not-found
// even if the source page still exists.
import { createClient } from '@supabase/supabase-js';

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
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return Response.json({ error: 'missing slug' }, { status: 400 });
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('external_news')
        .select('title, description, image_url, published_text, facebook_url')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return Response.json({ error: 'ไม่พบข่าวนี้' }, { status: 404 });
      }

      return Response.json({
        item: {
          title: data.title,
          published_date: data.published_text,
          image_url: data.image_url,
          description: data.description,
          facebook_url: data.facebook_url,
        },
      });
    } catch (err) {
      console.error('[sci-connect-news-detail]', err);
      return Response.json({ error: 'ไม่สามารถโหลดข่าวได้ในขณะนี้' }, { status: 502 });
    }
  },
};
