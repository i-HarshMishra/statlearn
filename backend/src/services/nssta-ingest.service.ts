import { PrismaClient } from '@prisma/client';
import pdfParse from 'pdf-parse';
import { generateFallbackText } from '../utils/gemini';

const prisma = new PrismaClient();

export interface NSSTAParsedEntry {
  title: string;
  topic?: string;
  targetAudience?: string;
  durationDays?: number;
  batchSize?: number;
  venue?: string;
  weekOrDate?: string;
}

export async function parseNSSTACalendar(buffer: Buffer): Promise<NSSTAParsedEntry[]> {
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;

  const prompt = `
You are an expert data extractor.
I have extracted text from an NSSTA (National Statistical Systems Training Academy) training calendar PDF.
The text is messy. Please extract all the training programmes mentioned in this text.

Return a JSON array of objects, where each object matches this structure:
{
  "title": "Name of the training programme",
  "topic": "Topic or category",
  "targetAudience": "Target participants (e.g. ISS/SSS/DES officers)",
  "durationDays": 5, // integer, representing days
  "batchSize": 30, // integer
  "venue": "Where it is held",
  "weekOrDate": "When it is held (e.g. Week 1, April 10-15)"
}

Text to analyze:
${text.substring(0, 30000)}
`;

  try {
    const resultText = await generateFallbackText(prompt, true);
    const cleaned = resultText.replace(/```json\s*|\s*```/g, '');
    const entries = JSON.parse(cleaned || '[]');
    return entries;
  } catch (error) {
    console.error('Failed to parse NSSTA calendar using AI:', error);
    
    // Very basic fallback
    return [{
      title: 'Extracted Training Programme (Fallback)',
      topic: 'General Statistics',
      targetAudience: 'ISS/SSS',
      durationDays: 3,
      batchSize: 30,
      venue: 'NSSTA, Greater Noida',
      weekOrDate: 'TBD'
    }];
  }
}

export async function ingestNSSTAProgrammes(buffer: Buffer, fileName: string) {
  const entries = await parseNSSTACalendar(buffer);
  const created = [];
  
  for (const entry of entries) {
    const record = await prisma.nSSTATrainingProgramme.create({
      data: {
        title: entry.title || 'Untitled Training',
        topic: entry.topic,
        targetAudience: entry.targetAudience,
        durationDays: entry.durationDays,
        batchSize: entry.batchSize,
        venue: entry.venue,
        weekOrDate: entry.weekOrDate,
        sourceDocument: fileName,
      }
    });
    created.push(record);
  }
  
  return created;
}
