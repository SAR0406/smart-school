
'use server';
/**
 * @fileOverview A standard chat flow using Gemini.
 */
import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function chatWithGemini(prompt: string): Promise<string> {
  const anwser = await ai.generate({
    model: gemini15Flash,
    prompt: `You must start every response with a relevant emoji. User query: ${prompt}`,
    history: [],
  });
  return anwser.text;
}
