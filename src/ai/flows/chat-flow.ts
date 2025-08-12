'use server';
/**
 * @fileOverview A Genkit flow for general chat.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the chat message, in Markdown format.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: z.string() },
    output: { schema: ChatOutputSchema },
    prompt: `You are a friendly and helpful AI assistant for a student. Keep your responses concise and helpful. Here is the user's message: \n\n{{input}}`,
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.string(),
    outputSchema: ChatOutputSchema,
  },
  async (prompt) => {
    const { output } = await chatPrompt(prompt);
    return output!;
  }
);

export async function chat(prompt: string): Promise<ChatOutput> {
  return chatFlow(prompt);
}
