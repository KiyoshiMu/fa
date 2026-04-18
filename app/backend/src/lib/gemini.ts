import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is missing in .env file');
}

// In the new SDK, initialization is different
const genai = new GoogleGenAI({ apiKey });

// Define Transaction Schema for Structured Outputs
export const transactionSchema = {
  description: "A list of categorized financial transactions",
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Date of transaction" },
      description: { type: Type.STRING, description: "Original transaction description" },
      amount: { type: Type.NUMBER, description: "Transaction amount (negative for outflow)" },
      category: {
        type: Type.STRING,
        enum: ["Fixed", "Variable", "Savings", "Income", "Unknown"],
        description: "Budget category based on 50/30/20 rule"
      }
    },
    required: ["date", "description", "amount", "category"]
  }
};

/**
 * Helper to call generate content with JSON response
 */
export const generateCategorizedJSON = async (prompt: string) => {
  // In the latest SDK (2026), we use gemini-flash-lite-latest
  const response = await genai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: transactionSchema
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('AI returned an empty response.');
  }
  return text;
};
