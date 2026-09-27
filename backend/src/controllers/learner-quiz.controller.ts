import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateQuizFromText } from '../utils/gemini';
import pdfParse from 'pdf-parse';
// @ts-ignore
import { parseOfficeAsync } from 'officeparser';

export async function generateLearnerQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    const { questionCount = 5 } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let extractedText = '';

    // Handle PDF Extraction
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text;
    } 
    // Handle PPTX Extraction
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      extractedText = await parseOfficeAsync(file.buffer);
    }
    // Handle plain text
    else if (file.mimetype === 'text/plain') {
      extractedText = file.buffer.toString('utf-8');
    } 
    // Unsupported type
    else {
      res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, PPTX or TXT file.' });
      return;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      res.status(400).json({ error: 'Not enough text extracted from the file to generate a quiz.' });
      return;
    }

    // Pass the text to Gemini
    const questions = await generateQuizFromText(extractedText, 'General', 'Medium', parseInt(questionCount as string) || 5);

    res.json({
      success: true,
      quiz: {
        title: file.originalname,
        questionCount: questions.length,
        questions: questions
      }
    });

  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz.' });
  }
}
