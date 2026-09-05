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
const SYSTEM_PROMPT = `คุณคือ AI ที่ช่วยนักเรียนเปรียบเทียบสาขาวิชา
ของคณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
วิเคราะห์เฉพาะจากข้อมูลสาขาที่ให้มาเท่านั้น ห้ามแต่งข้อมูลที่ไม่มีในรายการ
ตอบเป็นภาษาไทย กระชับ เป็นกลาง เน้นข้อมูลที่ช่วยให้ตัดสินใจเลือกสาขาได้

ตอบกลับเป็น JSON ดิบล้วนๆ เท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON object
ห้ามใส่ markdown code fence (\`\`\`) ห้ามมีคำอธิบายก่อนหรือหลัง JSON
โครงสร้าง JSON ต้องตรงตามนี้เป๊ะ (courseId ต้องเป็นค่า id จากรายการสาขาที่ให้มาเท่านั้น):
{"summary": string, "courses": [{"courseId": string, "bestFor": string, "pros": [string, 1-4 ข้อ], "cons": [string, 0-3 ข้อ]}, ครบทุกสาขาที่ให้มา], "verdict": string}`;

function courseLine(c) {
  return [
    `สาขา [${c.id}] ${c.title}${c.title_en ? ` (${c.title_en})` : ''}`,
    `คำอธิบาย: ${c.description || '-'}`,
    `อาชีพหลังจบ: ${(Array.isArray(c.careers) ? c.careers : []).join(', ') || '-'}`,
  ].join('\n');
}

function buildPrompt(courses) {
  const list = courses.map(courseLine).join('\n\n---\n\n');

  return `เปรียบเทียบสาขาต่อไปนี้:

${list}

งานของคุณ:
1. summary: สรุปภาพรวมความเหมือนและความต่างที่สำคัญของสาขาเหล่านี้ (2-4 ประโยค)
2. courses: สำหรับแต่ละสาขา (ครบทุกสาขา) ให้ระบุ
   - bestFor: สาขานี้เหมาะกับนักเรียนแบบไหน
   - pros: ข้อดี/จุดแข็ง 2-4 ข้อ
   - cons: ข้อควรพิจารณา 1-3 ข้อ
3. verdict: สรุปคำแนะนำว่านักเรียนแบบไหนควรเลือกสาขาไหน`;
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

    const { courses } = await request.json();

    if (!Array.isArray(courses) || courses.length < 2) {
      return Response.json({ error: 'ต้องมีอย่างน้อย 2 สาขาเพื่อเปรียบเทียบ' }, { status: 400 });
    }

    const courseIds = courses.map((c) => c.id);

    const perCourse = z.object({
      courseId: z.enum(courseIds),
      bestFor: z.string(),
      pros: z.array(z.string()).min(1).max(4),
      cons: z.array(z.string()).max(3),
    });

    const schema = z.object({
      summary: z.string(),
      courses: z.array(perCourse),
      verdict: z.string(),
    });

    try {
      const model = await getAiModel(process.env.AI_MODEL || 'openai/gpt-4o-mini');

      const { object: rawObject } = await generateObject({
        // baseURL only supports Chat Completions, so use the .chat() factory.
        model: aiProvider.chat(model),
        // output:"no-schema" — see the comment above SYSTEM_PROMPT for why.
        output: 'no-schema',
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(courses),
      });

      const object = schema.parse(rawObject);

      return Response.json(object);
    } catch (err) {
      console.error('[compare-courses]', err);
      return Response.json(
        { error: 'ไม่สามารถวิเคราะห์การเปรียบเทียบได้ในขณะนี้' },
        { status: 502 },
      );
    }
  },
};
