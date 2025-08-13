
'use server';
/**
 * @fileOverview A standard chat flow using Gemini.
 */
import { ai } from '@/ai/genkit';
import { gemini15Pro } from '@genkit-ai/googleai';

export async function chatWithGemini(prompt: string): Promise<string> {
  const anwser = await gemini15Pro.generate({
    prompt,
    history: [],
  });
  return anwser.text;
}
