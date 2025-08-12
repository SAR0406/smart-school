'use server';
/**
 * @fileOverview A global Genkit AI instance.
 */

import {genkit} from '@genkit-ai/ai';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // Log to the console in a structured format.
  logSinks: [
    async (log) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(log);
      }
    },
  ],
  // Log all traces to the console.
  traceStore: 'dev',
});
