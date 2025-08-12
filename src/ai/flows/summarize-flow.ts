
'use server';
/**
 * @fileOverview A Genkit flow for summarizing text.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the input text.'),
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;


const summarizePrompt = ai.definePrompt({
    name: 'summarizePrompt',
    input: { schema: z.string() },
    output: { schema: SummarizeOutputSchema },
    prompt: `Summarize the following text into a few key paragraphs: \n\n{{input}}`,
});


const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: z.string(),
    outputSchema: SummarizeOutputSchema,
  },
  async (text) => {
    const { output } = await summarizePrompt(text);
    return output!;
  }
);

export async function summarizeText(text: string): Promise<SummarizeOutput> {
  return summarizeFlow(text);
}
