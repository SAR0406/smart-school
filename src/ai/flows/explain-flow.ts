'use server';
/**
 * @fileOverview A Genkit flow for explaining concepts.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExplainOutputSchema = z.object({
  response: z.string().describe('The AI-generated explanation, in Markdown format.'),
});
export type ExplainOutput = z.infer<typeof ExplainOutputSchema>;


const explainPrompt = ai.definePrompt({
    name: 'explainPrompt',
    input: { schema: z.string() },
    output: { schema: ExplainOutputSchema },
    prompt: `You are a teacher's assistant. Explain the following concept in simple terms, as if you were explaining it to a 12-year-old. Use analogies and simple language. Use Markdown for formatting.\n\nConcept: {{input}}`,
});


const explainFlow = ai.defineFlow(
  {
    name: 'explainFlow',
    inputSchema: z.string(),
    outputSchema: ExplainOutputSchema,
  },
  async (prompt) => {
    const { output } = await explainPrompt(prompt);
    return output!;
  }
);

export async function explainConcept(prompt: string): Promise<ExplainOutput> {
  return explainFlow(prompt);
}
