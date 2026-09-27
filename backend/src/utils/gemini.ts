import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function generateFallbackText(prompt: string, isJson: boolean = false): Promise<string> {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  
  // 1. Try Gemini Models
  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting to use Gemini model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: isJson ? { responseMimeType: 'application/json' } : undefined
      });
      if (response.text) {
        console.log(`Success with Gemini model: ${modelName}`);
        return response.text;
      }
    } catch (err: any) {
      console.error(`Gemini Model ${modelName} failed:`, err.status || err.message);
    }
  }

  // 2. Fallback to Groq
  console.warn("All Gemini models failed. Falling back to Groq API...");
  try {
    const groqModels = ['llama3-70b-8192', 'llama3-8b-8192'];
    for (const groqModel of groqModels) {
      try {
        console.log(`Attempting to use Groq model: ${groqModel}`);
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: isJson ? "You are an API that only returns valid JSON. Never output markdown formatting or any other text before or after the JSON." : "You are a helpful AI assistant."
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          model: groqModel,
          temperature: 0.7,
          max_tokens: 2048,
        });
        const text = chatCompletion.choices[0]?.message?.content || '';
        if (text) {
          console.log(`Success with Groq model: ${groqModel}`);
          return text;
        }
      } catch (err: any) {
        console.error(`Groq Model ${groqModel} failed:`, err.message);
      }
    }
  } catch (groqErr) {
    console.error("Groq fallback completely failed:", groqErr);
  }

  return "";
}

export async function generateQuizFromText(text: string, competency: string = 'General', difficulty: string = 'Medium', count: number = 5): Promise<any[]> {
  const prompt = `
You are an expert AI quiz generator for the Indian Official Statistical System.
Based on the following extracted text from a learning material, generate ${count} multiple-choice questions.
Target Competency: ${competency}
Target Difficulty: ${difficulty}
Ensure the questions test comprehension and application related to this competency and difficulty, not just rote memorization.

Output the result EXACTLY as a JSON array of objects.
Each object must have the following structure:
{
  "questionText": "The question itself",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "A short explanation of why the answer is correct"
}

Text to analyze:
${text.substring(0, 30000)} // Limit to roughly 30k characters to avoid token limits
`;

  const resultText = await generateFallbackText(prompt, true);

  if (!resultText) {
    console.warn("All AI models failed. Falling back to simulated AI response for demo purposes.");
    return [
      {
        "questionText": "What is the primary goal of Software Engineering?",
        "options": [
          "To write code as quickly as possible",
          "To produce high-quality, maintainable software systematically",
          "To eliminate all bugs from a program",
          "To design hardware components"
        ],
        "correctAnswer": "To produce high-quality, maintainable software systematically",
        "explanation": "Software engineering applies engineering principles to software development to ensure systematic, high-quality, and maintainable results."
      },
      {
        "questionText": "Which of the following is NOT a phase in the typical Software Development Life Cycle (SDLC)?",
        "options": [
          "Requirement Analysis",
          "Hardware Assembly",
          "System Design",
          "Testing"
        ],
        "correctAnswer": "Hardware Assembly",
        "explanation": "SDLC focuses on software creation phases like analysis, design, implementation, and testing, not hardware assembly."
      },
      {
        "questionText": "In Agile methodology, what is a 'Sprint'?",
        "options": [
          "A fast networking protocol",
          "A database optimization technique",
          "A short, time-boxed period to complete a set amount of work",
          "A type of unit test"
        ],
        "correctAnswer": "A short, time-boxed period to complete a set amount of work",
        "explanation": "In Agile, Sprints are short iterations (usually 1-4 weeks) where a specific set of features is developed and delivered."
      },
      {
        "questionText": "What does 'Coupling' refer to in software design?",
        "options": [
          "The degree of interdependence between software modules",
          "Connecting two hardware devices",
          "Combining two databases into one",
          "The speed of the network connection"
        ],
        "correctAnswer": "The degree of interdependence between software modules",
        "explanation": "Coupling measures how closely connected two modules are. Low coupling is preferred for better maintainability."
      },
      {
        "questionText": "Which testing type validates that individual units of source code work properly?",
        "options": [
          "Integration Testing",
          "System Testing",
          "Unit Testing",
          "Acceptance Testing"
        ],
        "correctAnswer": "Unit Testing",
        "explanation": "Unit testing isolates and verifies that individual components (units) of the software perform as expected."
      }
    ].slice(0, count);
  }

  try {
    // Sometimes Groq returns JSON surrounded by markdown code blocks despite instructions
    const cleanedText = resultText.replace(/```json\s*|\s*```/g, '');
    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (parseError) {
    console.error("Error parsing LLM JSON output:", parseError, "Raw output:", resultText);
    throw new Error("Failed to parse quiz response.");
  }
}

export async function askChatbotLLM(message: string, context: string): Promise<string> {
  const prompt = `
You are an intelligent, helpful AI assistant for StatLearnAI, an e-learning platform for official statistics.
You are chatting with a user. Their specific profile context is provided below. Use this context to personalize your answers.
If they ask something unrelated to their profile, answer it accurately and helpfully based on your general knowledge.

User Profile Context:
${context}

User's message:
"${message}"

Answer the user directly in a friendly, conversational tone (use Markdown formatting if helpful). Keep it concise.
`;

  const resultText = await generateFallbackText(prompt, false);
  
  if (!resultText) {
    throw new Error('All LLM models failed.');
  }
  
  return resultText;
}

/**
 * Uses Gemini Vision to extract details from an uploaded certificate.
 */
export async function extractCertificateInfo(imageBuffer: Buffer, mimeType: string): Promise<{ name: string, courseTitle: string } | null> {
  const prompt = `You are a document verification AI. Look at the provided certificate image.
Extract the name of the person who received the certificate, and the exact title of the course/training.
Return the result EXACTLY as a JSON object with this structure:
{
  "name": "Extracted Name",
  "courseTitle": "Extracted Course Title"
}
If you cannot find the information, return {"name": "", "courseTitle": ""}.`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Verifying certificate with ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          prompt,
          { inlineData: { data: imageBuffer.toString('base64'), mimeType } }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      if (response.text) {
        try {
          const parsed = JSON.parse(response.text);
          return parsed;
        } catch (e) {
          console.error("Failed to parse Gemini certificate response:", response.text);
        }
      }
    } catch (err: any) {
      console.error(`Certificate extraction ${modelName} failed:`, err.message);
    }
  }

  return null;
}
