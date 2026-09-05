// Lets an admin/editor force-run the sync-sci-news Edge Function from the
// admin dashboard's SCI Connect tab, instead of waiting for the 30-minute
// cron. The Edge Function itself only checks for a valid Supabase JWT (any
// anon-key request passes that), not a role, so the role check has to
// happen here before we call it — via the shared requireAdminUser() helper.
import { requireAdminUser } from '../_lib/adminAuth.js';

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const auth = await requireAdminUser(request);
    if (!auth.ok) return auth.response;

    try {
      const res = await fetch(`${auth.url}/functions/v1/sync-sci-news`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.anonKey}`,
          apikey: auth.anonKey,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sync-sci-news returned an error');

      return Response.json(data);
    } catch (err) {
      console.error('[admin/sync-sci-news] failed', err);
      return Response.json({ error: 'บังคับอัปเดตข่าวไม่สำเร็จ' }, { status: 502 });
    }
  },
};
