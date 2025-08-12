'use server';
/**
 * @fileOverview A Genkit flow for generating notes.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const NotesOutputSchema = z.object({
  notes: z.string().describe('The generated notes in Markdown format.'),
});
export type NotesOutput = z.infer<typeof NotesOutputSchema>;


const notesPrompt = ai.definePrompt({
    name: 'notesPrompt',
    input: { schema: z.string() },
    output: { schema: NotesOutputSchema },
    prompt: `Generate detailed, well-structured study notes in Markdown format on the following topic: "{{input}}". Use headings, bullet points, and bold text to organize the information clearly.`,
});


const notesFlow = ai.defineFlow(
  {
    name: 'notesFlow',
    inputSchema: z.string(),
    outputSchema: NotesOutputSchema,
  },
  async (topic) => {
    const { output } = await notesPrompt(topic);
    return output!;
  }
);

export async function generateNotes(topic: string): Promise<NotesOutput> {
  return notesFlow(topic);
}
