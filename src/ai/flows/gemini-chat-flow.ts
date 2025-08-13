
'use server';
/**
 * @fileOverview A standard chat flow using Gemini.
 */
import { ai, model } from '@/ai/genkit';
import { z } from 'zod';

export async function chatWithGemini(prompt: string): Promise<string> {
  const anwser = await model.generate({
    prompt,
    history: [],
  });
  return anwser.text;
}
