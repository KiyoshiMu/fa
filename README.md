# Financial Analysis (FA) Project

This project provides tools for investment profiling, savings plan generation, and cash flow analysis, leveraging AI-powered insights through Google's Gemini.

## Features

- **Investment Profiling**: Calculate risk profiles and return rates based on questionnaire answers.
- **Savings Plan Generation**: Project savings needed to reach a goal amount, accounting for investment returns.
- **Cash Flow Analysis**: Analyze transaction data to understand spending and income.
- **AI-Powered Analysis**: Use Google Gemini to process raw transaction text and extract structured financial insights.

## Project Structure

- `app/backend`: Express-based TypeScript backend providing the core API.
- `app/frontend`: (To be implemented) React/Angular frontend for user interaction.
- `.agents`: Documentation and agent skills for the project.

## Getting Started

### Backend

1. Navigate to `app/backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /health`: Health check.
- `POST /api/invest/calc-profile`: Calculate investment profile.
- `POST /api/invest/generate-plan`: Generate a savings projection plan.
- `POST /api/cashflow/analyze`: Analyze a list of transactions.
- `POST /api/cashflow/analyze-ai`: Analyze raw text using Gemini AI.

## License

This project is licensed under the ISC License.
