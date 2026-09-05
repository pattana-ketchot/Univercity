import { createEmbedding } from './rag.js';

const CHUNK_SIZE = 800; // characters
const CHUNK_OVERLAP = 100;

export function cleanText(text) {
  return (text || '')
    .replace(/<[^>]+>/g, ' ') // strip any stray HTML
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const clean = cleanText(text);
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }
  return chunks;
}

// Chunks + embeds + upserts a document's content into rag_documents.
// `supabase` must be scoped to an authenticated admin/editor session — RLS enforces the write.
export async function ingestDocument(supabase, { sourceType, sourceId, title, content }) {
  const chunks = chunkText(content);

  if (chunks.length === 0) {
    await supabase.from('rag_documents').delete().eq('source_type', sourceType).eq('source_id', sourceId);
    return { chunkCount: 0 };
  }

  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await createEmbedding(chunks[i], 'RETRIEVAL_DOCUMENT');
    rows.push({
      source_type: sourceType,
      source_id: sourceId,
      title,
      content: chunks[i],
      chunk_index: i,
      embedding,
      updated_at: new Date().toISOString(),
    });
  }

  const { error: upsertError } = await supabase
    .from('rag_documents')
    .upsert(rows, { onConflict: 'source_type,source_id,chunk_index' });

  if (upsertError) throw upsertError;

  // Content may have gotten shorter on update — drop any leftover chunks past the new count
  // so an old chunk_index 5 doesn't linger after a re-ingest only produces 3 chunks.
  const { error: deleteError } = await supabase
    .from('rag_documents')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .gte('chunk_index', chunks.length);

  if (deleteError) throw deleteError;

  return { chunkCount: chunks.length };
}
