import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getAiModel } from './_lib/aiConfig.js';
import { searchRelevantContext, buildRAGPrompt, toSources } from './_lib/rag.js';

// OpenAI-compatible provider pointed at an external base URL (e.g. OpenRouter,
// or any other OpenAI-compatible endpoint set via AI_BASE_URL).
const aiProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
});

const SYSTEM_PROMPT = `คุณคือ "SCI Advisor" ผู้ช่วย AI แนะแนวสาขา หลักสูตร และอาชีพ
ของคณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
ตอบเป็นภาษาไทย น้ำเสียงเป็นกันเองแต่สุภาพ กระชับ ตรงประเด็น
ถ้าไม่แน่ใจข้อมูลเฉพาะเจาะจงของมหาวิทยาลัย (เช่น ค่าเทอม รอบรับสมัคร) ให้แนะนำให้ติดต่อฝ่ายทะเบียนหรือคณะโดยตรง`;

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (!process.env.AI_API_KEY) {
      return Response.json(
        { error: 'AI is not configured: missing AI_API_KEY' },
        { status: 500 },
      );
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'messages is required' }, { status: 400 });
    }

    const model = await getAiModel(process.env.AI_MODEL || 'openai/gpt-4o-mini');

    // RAG: ground the answer in website content before falling back to general knowledge.
    // Retrieval failures should never break the chat — just answer without extra context.
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    let systemPrompt = SYSTEM_PROMPT;
    let sources = [];

    if (lastUserMessage) {
      try {
        const context = await searchRelevantContext(lastUserMessage, { matchCount: 5 });
        systemPrompt = `${SYSTEM_PROMPT}\n\n${buildRAGPrompt(context, lastUserMessage)}`;
        sources = toSources(context);
      } catch (err) {
        console.error('[chat] RAG retrieval failed, answering without context', err);
      }
    }

    const result = streamText({
      // baseURL only supports Chat Completions, so use the .chat() factory.
      model: aiProvider.chat(model),
      system: systemPrompt,
      messages: messages.map(({ role, content }) => ({ role, content })),
      // Errors mid-stream are otherwise swallowed silently by toTextStreamResponse().
      onError: ({ error }) => {
        console.error('[chat] streamText error', error);
      },
    });

    return result.toTextStreamResponse({
      // JSON body would break the plain-text stream the chat UI reads today, so sources
      // ride along as a header instead. base64 because header values must be ASCII.
      headers: {
        'X-RAG-Sources': Buffer.from(JSON.stringify(sources)).toString('base64'),
      },
    });
  },
};
