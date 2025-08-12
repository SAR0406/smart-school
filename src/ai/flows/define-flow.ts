'use server';
/**
 * @fileOverview A Genkit flow for defining terms.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DefineOutputSchema = z.object({
  response: z.string().describe('The AI-generated definition, in Markdown format.'),
});
export type DefineOutput = z.infer<typeof DefineOutputSchema>;


const definePrompt = ai.definePrompt({
    name: 'definePrompt',
    input: { schema: z.string() },
    output: { schema: DefineOutputSchema },
    prompt: `You are an academic assistant. Define the following term clearly and concisely. Use Markdown for formatting if necessary.\n\nTerm: {{input}}`,
});


const defineFlow = ai.defineFlow(
  {
    name: 'defineFlow',
    inputSchema: z.string(),
    outputSchema: DefineOutputSchema,
  },
  async (prompt) => {
    const { output } = await definePrompt(prompt);
    return output!;
  }
);

export async function defineTerm(prompt: string): Promise<DefineOutput> {
  return defineFlow(prompt);
}
