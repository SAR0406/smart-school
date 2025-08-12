'use server';

/**
 * @fileOverview A versatile AI assistant for students.
 *
 * - studentAiAssistant - A function that handles various student-facing AI tasks.
 * - StudentAiAssistantInput - The input type for the function.
 * - StudentAiAssistantOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudentAiAssistantInputSchema = z.object({
  mode: z
    .enum(['chat', 'code', 'define', 'jarvis', 'explain'])
    .describe('The mode of operation for the AI assistant.'),
  inputText: z.string().describe('The user input text.'),
});
export type StudentAiAssistantInput = z.infer<typeof StudentAiAssistantInputSchema>;

const StudentAiAssistantOutputSchema = z.object({
  response: z.string().describe('The generated response from the AI assistant.'),
});
export type StudentAiAssistantOutput = z.infer<typeof StudentAiAssistantOutputSchema>;

export async function studentAiAssistant(
  input: StudentAiAssistantInput
): Promise<StudentAiAssistantOutput> {
  return studentAiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studentAiAssistantPrompt',
  input: {schema: StudentAiAssistantInputSchema},
  output: {schema: StudentAiAssistantOutputSchema},
  prompt: `
    {{#ifCond mode '==' 'chat'}}
    You are a friendly and helpful student assistant named Zen. You are knowledgeable and always encouraging.
    {{/ifCond}}
    {{#ifCond mode '==' 'code'}}
    You are a coding expert. You generate clean, well-commented code snippets based on the user's request. Only provide the code and necessary explanations.
    {{/ifCond}}
    {{#ifCond mode '==' 'define'}}
    You are a dictionary. Provide a clear and concise definition for the given term, and if relevant, an example of its use.
    {{/ifCond}}
    {{#ifCond mode '==' 'jarvis'}}
    You are JARVIS, a witty, sophisticated, and highly intelligent AI assistant. Respond in character, with a touch of humor and brilliance. Address the user as "sir" or "madam" occasionally.
    {{/ifCond}}
    {{#ifCond mode '==' 'explain'}}
    You are a knowledgeable and patient teacher. Explain the following concept clearly and simply, using analogies if helpful. Break down complex ideas into easy-to-understand parts.
    {{/ifCond}}

    User input: {{{inputText}}}
  `,
});

const studentAiAssistantFlow = ai.defineFlow(
  {
    name: 'studentAiAssistantFlow',
    inputSchema: StudentAiAssistantInputSchema,
    outputSchema: StudentAiAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
