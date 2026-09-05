import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md'];

// Extracts plain text from an uploaded knowledge-base file so it can be pasted
// into the content field (and from there go through the normal ingest pipeline).
export async function extractTextFromFile(buffer, ext) {
  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error('ไฟล์ใหญ่เกินไป (สูงสุด 15MB)');
  }

  if (ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (ext === 'txt' || ext === 'md') {
    return buffer.toString('utf-8');
  }

  throw new Error('ไม่รองรับไฟล์ประเภทนี้ (รองรับ .pdf, .docx, .txt, .md)');
}
