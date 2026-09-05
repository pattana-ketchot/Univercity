import { extractTextFromFile, ALLOWED_EXTENSIONS } from '../_lib/fileExtract.js';
import { requireAdminUser } from '../_lib/adminAuth.js';

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const auth = await requireAdminUser(request);
    if (!auth.ok) return auth.response;

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'file is required' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return Response.json(
        { error: 'ไม่รองรับไฟล์ประเภทนี้ (รองรับ .pdf, .docx, .txt, .md)' },
        { status: 400 },
      );
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromFile(buffer, ext);
      return Response.json({ text });
    } catch (err) {
      console.error('[admin/extract-file] failed', err);
      return Response.json({ error: err.message || 'อ่านไฟล์ไม่สำเร็จ' }, { status: 500 });
    }
  },
};
