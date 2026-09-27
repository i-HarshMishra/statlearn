const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env' });

async function test() {
  try {
    console.log("Testing Gemini API Key...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello, are you there?'
    });
    console.log("SUCCESS! Gemini API is working locally. Response: ", response.text);
  } catch (error) {
    console.error("ERROR! Gemini API failed.");
    if (error.status === 429 || error.status === 403) {
      console.error("Reason: 429 Too Many Requests or 403 Quota Exceeded");
    } else {
      console.error("Reason:", error.message || error.status);
    }
  }
}
test();
