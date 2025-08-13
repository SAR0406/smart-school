
'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { gemini15Pro } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logSinks: [
    async (log) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(log);
      }
    },
  ],
  traceStore: 'dev',
});

export const model = gemini15Pro;
