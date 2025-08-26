
'use server';
/**
 * @fileOverview A unified chat flow that can adapt to different AI personas.
 */
import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

const UnifiedChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s input.'),
  systemPrompt: z.string().describe('The instructions that define the AI\'s persona or task.'),
});
export type UnifiedChatInput = z.infer<typeof UnifiedChatInputSchema>;


const UnifiedChatOutputSchema = z.string().describe('The AI\'s response.');
export type UnifiedChatOutput = z.infer<typeof UnifiedChatOutputSchema>;


const unifiedChatPrompt = ai.definePrompt({
    name: 'unifiedChatPrompt',
    input: { schema: UnifiedChatInputSchema },
    output: { format: 'text' },
    model: gemini15Flash,
    prompt: `{{{systemPrompt}}}

    User query: {{{prompt}}}`,
});

const unifiedChatFlow = ai.defineFlow(
  {
    name: 'unifiedChatFlow',
    inputSchema: UnifiedChatInputSchema,
    outputSchema: UnifiedChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await unifiedChatPrompt(input);
    return llmResponse.text;
  }
);


export async function getAIResponse(input: UnifiedChatInput): Promise<UnifiedChatOutput> {
  const result = await unifiedChatFlow(input);
  if (!result) {
    throw new Error("The AI failed to generate a response. Please try again.");
  }
  return result;
}
