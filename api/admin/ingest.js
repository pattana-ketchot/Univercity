import { ingestDocument } from '../_lib/ingest.js';
import { requireAdminUser } from '../_lib/adminAuth.js';

const SOURCE_TYPES = ['major', 'news', 'article', 'knowledge'];

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const auth = await requireAdminUser(request);
    if (!auth.ok) return auth.response;

    const { sourceType, sourceId, title, content } = await request.json();

    if (!SOURCE_TYPES.includes(sourceType) || !sourceId || !title) {
      return Response.json({ error: 'sourceType, sourceId, and title are required' }, { status: 400 });
    }

    try {
      const result = await ingestDocument(auth.supabase, { sourceType, sourceId, title, content: content || '' });
      return Response.json({ ok: true, chunks: result.chunkCount });
    } catch (err) {
      console.error('[admin/ingest] failed', err);
      return Response.json({ error: 'Ingestion failed' }, { status: 500 });
    }
  },
};
