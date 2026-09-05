import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAiModel } from './_lib/aiConfig.js';

const aiProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
});

// ai_settings.model (gemini-3.1-flash-lite via a third-party OpenAI-compatible
// gateway, as of writing) silently ignores response_format:"json_schema" — it
// just chats normally in markdown instead of erroring, which made
// generateObject's default (schema-based) mode fail every time with
// AI_NoObjectGeneratedError. The same gateway *does* honor plain
// response_format:"json_object". generateObject only sends json_object (no
// schema attached) when called with output:"no-schema", so we use that and
// describe the shape in the prompt instead, then validate with the schema
// ourselves afterward — see the fetch handler below.
const SYSTEM_PROMPT = `คุณคือ AI ที่ช่วยแนะนำสาขาวิชาที่เหมาะสมที่สุดให้กับนักเรียน
ของคณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
โดยพิจารณาจากคำตอบแบบสอบถามความสนใจ ความถนัด และเป้าหมายอาชีพของนักเรียน
เทียบกับรายชื่อสาขาที่มีอยู่จริงที่ให้มาเท่านั้น ห้ามแนะนำสาขาที่ไม่อยู่ในรายการ

ตอบกลับเป็น JSON ดิบล้วนๆ เท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON object
ห้ามใส่ markdown code fence (\`\`\`) ห้ามมีคำอธิบายก่อนหรือหลัง JSON
โครงสร้าง JSON ต้องตรงตามนี้เป๊ะ (courseId ต้องเป็นค่า id จากรายการสาขาที่ให้มาเท่านั้น):
{"primary": {"courseId": string, "matchScore": number (0-100), "reason": string}, "alternatives": [เหมือน primary สูงสุด 2 รายการ], "summary": string}`;

function buildPrompt(answers, courses) {
  const list = courses
    .map((c) => `- [${c.id}] ${c.title}: ${c.description || ''} | อาชีพที่เกี่ยวข้อง: ${(c.careers || []).join(', ') || '-'}`)
    .join('\n');

  return `ข้อมูลของนักเรียนจากแบบสอบถาม:
- สายการเรียน: ${answers.track || '-'}
- เพศ: ${answers.gender || '-'}
- วิชาที่ชอบ: ${(answers.subjects || []).join(', ') || '-'}
- ความสนใจ: ${(answers.interests || []).join(', ') || '-'}
- ความถนัด: ${(answers.skills || []).join(', ') || '-'}
- เป้าหมายอาชีพ: ${(answers.goals || []).join(', ') || '-'}
- สภาพแวดล้อมการทำงานที่ต้องการ: ${answers.environment || '-'}

รายชื่อสาขาที่เปิดสอนจริง (เลือกได้เฉพาะจากรายการนี้เท่านั้น):
${list}

จงเลือกสาขาที่เหมาะสมที่สุด 1 สาขาเป็นคำแนะนำหลัก และสาขาสำรองอีกไม่เกิน 2 สาขา
พร้อมให้คะแนนความเหมาะสม (0-100) และเหตุผลสั้นๆ เป็นภาษาไทยสำหรับแต่ละสาขา
และสรุปภาพรวมสั้นๆ ว่าทำไมจึงแนะนำแบบนี้`;
}

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

    const { answers, courses } = await request.json();

    if (!Array.isArray(courses) || courses.length === 0) {
      return Response.json({ error: 'courses is required' }, { status: 400 });
    }

    const courseIds = courses.map((c) => c.id);

    const recommendation = z.object({
      courseId: z.enum(courseIds),
      matchScore: z.number().min(0).max(100),
      reason: z.string(),
    });

    const schema = z.object({
      primary: recommendation,
      alternatives: z.array(recommendation).max(2),
      summary: z.string(),
    });

    try {
      const model = await getAiModel(process.env.AI_MODEL || 'openai/gpt-4o-mini');

      const { object: rawObject } = await generateObject({
        // baseURL only supports Chat Completions, so use the .chat() factory.
        model: aiProvider.chat(model),
        // output:"no-schema" — see the comment above SYSTEM_PROMPT for why.
        output: 'no-schema',
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(answers || {}, courses),
      });

      const object = schema.parse(rawObject);

      return Response.json(object);
    } catch (err) {
      console.error('[recommend-major]', err);
      return Response.json(
        { error: 'ไม่สามารถวิเคราะห์ผลลัพธ์ได้ในขณะนี้' },
        { status: 502 },
      );
    }
  },
};
