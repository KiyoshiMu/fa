import { analyzeWithAI } from '../services/cashflowService.js';
import dotenv from 'dotenv';

dotenv.config();

const testText = `
04/10/2026 RENT PAYMENT -3200.00
04/11/2026 ADOBE SUBSCRIPTION -55.00
04/12/2026 SALARY DEPOSIT +5000.00
04/13/2026 STARBUCKS COFFEE -6.50
`;

const testGemini = async () => {
  console.log("🚀 Testing Real Gemini Integration...");
  try {
    const transactions = await analyzeWithAI(testText);
    console.log("✅ Received Categorized Transactions:");
    console.table(transactions);
    
    // Check if categorization makes sense
    const coffee = transactions.find(t => t.description.toLowerCase().includes('coffee'));
    if (coffee && coffee.category === 'Variable') {
      console.log("✨ Logic Check: Coffee correctly categorized as Variable.");
    }
  } catch (error) {
    console.error("❌ Gemini Test Failed:", error);
  }
};

testGemini();
