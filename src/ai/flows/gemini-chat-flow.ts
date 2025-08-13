
'use server';
/**
 * @fileOverview A standard chat flow using Gemini.
 */
import { ai } from '@/ai/genkit';
import { gemini15Pro } from '@genkit-ai/googleai';

export async function chatWithGemini(prompt: string): Promise<string> {
  const anwser = await ai.generate({
    model: gemini15Pro,
    prompt,
    history: [],
  });
  return anwser.text;
}
