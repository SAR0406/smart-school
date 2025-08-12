'use server';
/**
 * @fileOverview A Genkit flow for helping with code.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CodeHelperOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the coding question, in Markdown format.'),
});
export type CodeHelperOutput = z.infer<typeof CodeHelperOutputSchema>;


const codeHelperPrompt = ai.definePrompt({
    name: 'codeHelperPrompt',
    input: { schema: z.string() },
    output: { schema: CodeHelperOutputSchema },
    prompt: `You are a friendly and helpful coding assistant. A student has the following question or code snippet. Provide a clear explanation, and if applicable, a corrected or improved code snippet. Use Markdown for formatting code blocks. \n\nQuestion/Code: \n{{input}}`,
});


const codeHelperFlow = ai.defineFlow(
  {
    name: 'codeHelperFlow',
    inputSchema: z.string(),
    outputSchema: CodeHelperOutputSchema,
  },
  async (prompt) => {
    const { output } = await codeHelperPrompt(prompt);
    return output!;
  }
);

export async function helpWithCode(prompt: string): Promise<CodeHelperOutput> {
  return codeHelperFlow(prompt);
}
