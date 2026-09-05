import { google } from '@ai-sdk/google';
import { embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Must match the `vector(768)` column + match_rag_documents RPC in supabase_migration_rag.sql
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

const SOURCE_TYPE_LABEL = {
  major: 'หลักสูตร',
  news: 'ข่าวสาร',
  article: 'บทความ',
  knowledge: 'ข้อมูลความรู้',
};

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing');
  return createClient(url, key);
}

// taskType: 'RETRIEVAL_QUERY' for a user question, 'RETRIEVAL_DOCUMENT' when embedding content to store (used in Step 7 ingestion)
export async function createEmbedding(text, taskType = 'RETRIEVAL_QUERY') {
  const { embedding } = await embed({
    model: google.embedding(EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      google: { outputDimensionality: EMBEDDING_DIMENSIONS, taskType },
    },
  });
  return embedding;
}

// Embeds the query and finds the top matching chunks via the match_rag_documents RPC.
export async function searchRelevantContext(query, { matchCount = 5, sourceType = null } = {}) {
  const queryEmbedding = await createEmbedding(query, 'RETRIEVAL_QUERY');

  const { data, error } = await getSupabase().rpc('match_rag_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter_source_type: sourceType,
  });

  if (error) {
    console.error('[rag] searchRelevantContext error', error);
    return [];
  }

  return data || [];
}

// Builds the instruction block to prepend to the existing chat system prompt.
// `context` is the array returned by searchRelevantContext(); `question` is the user's message.
export function buildRAGPrompt(context, question) {
  if (!context || context.length === 0) {
    return `ไม่พบข้อมูลที่เกี่ยวข้องกับคำถาม "${question}" ในฐานข้อมูลของเว็บไซต์
ให้บอกผู้ใช้ตรงๆ ว่าไม่มีข้อมูลนี้ในฐานข้อมูลของเว็บไซต์ ก่อนจะเสริมด้วยความรู้ทั่วไป (ถ้ามี)
โดยแยกให้ชัดเจนว่าส่วนไหนเป็นความรู้ทั่วไป ไม่ใช่ข้อมูลจากเว็บไซต์`;
  }

  const contextBlock = context
    .map((chunk, i) => `[${i + 1}] (${SOURCE_TYPE_LABEL[chunk.source_type] || chunk.source_type}) ${chunk.title}\n${chunk.content}`)
    .join('\n\n');

  return `ใช้ "ข้อมูลจากเว็บไซต์" ด้านล่างนี้เป็นแหล่งข้อมูลหลักในการตอบคำถามของผู้ใช้
- ถ้าคำตอบอยู่ในข้อมูลที่ให้มา ให้ตอบโดยอ้างอิงจากข้อมูลนั้นเป็นหลัก
- ห้ามสร้างข้อมูลเฉพาะเจาะจงของมหาวิทยาลัยขึ้นเองที่ไม่มีอยู่ในข้อมูลด้านล่าง (เช่น ตัวเลข วันที่ ชื่อเฉพาะ)
- ถ้าข้อมูลด้านล่างไม่เพียงพอต่อการตอบคำถาม ให้บอกตรงๆ ก่อนว่า "ไม่มีข้อมูลนี้ในฐานข้อมูลของเว็บไซต์" จากนั้นค่อยเสริมด้วยความรู้ทั่วไปได้ (ถ้ามี) โดยแยกให้ชัดเจนว่าส่วนไหนเป็นความรู้ทั่วไป

ข้อมูลจากเว็บไซต์:
${contextBlock}`;
}

// Collapses retrieved chunks into one citation per source document (a document can match via multiple chunks).
export function toSources(context) {
  const seen = new Map();
  for (const chunk of context || []) {
    const key = `${chunk.source_type}:${chunk.source_id}`;
    if (!seen.has(key)) {
      seen.set(key, { title: chunk.title, source_type: chunk.source_type, source_id: chunk.source_id });
    }
  }
  return [...seen.values()];
}
