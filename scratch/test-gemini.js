const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: 'backend/.env' });

async function test() {
  try {
    console.log("Testing Gemini API Key...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Hello, are you there?'
    });
    console.log("SUCCESS! Gemini API is working locally. Response: ", response.text);
  } catch (error) {
    console.error("ERROR! Gemini API failed.");
    if (error.status === 429) {
      console.error("Reason: 429 Too Many Requests (Quota Exceeded / Rate Limited)");
    } else {
      console.error("Reason:", error.message || error.status);
    }
  }
}
test();
