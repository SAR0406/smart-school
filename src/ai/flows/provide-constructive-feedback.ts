'use server';

/**
 * @fileOverview A flow that provides constructive feedback on essays or assignments.
 *
 * - provideConstructiveFeedback - A function that provides constructive feedback.
 * - ProvideConstructiveFeedbackInput - The input type for the provideConstructiveFeedback function.
 * - ProvideConstructiveFeedbackOutput - The return type for the provideConstructiveFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideConstructiveFeedbackInputSchema = z.object({
  text: z
    .string()
    .describe('The essay or assignment text to provide feedback on.'),
  criteria: z
    .string()
    .optional()
    .describe(
      'Optional criteria or guidelines for the feedback, such as specific areas to focus on or requirements to meet.'
    ),
});
export type ProvideConstructiveFeedbackInput = z.infer<
  typeof ProvideConstructiveFeedbackInputSchema
>;

const ProvideConstructiveFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe('The constructive feedback on the essay or assignment.'),
});
export type ProvideConstructiveFeedbackOutput = z.infer<
  typeof ProvideConstructiveFeedbackOutputSchema
>;

export async function provideConstructiveFeedback(
  input: ProvideConstructiveFeedbackInput
): Promise<ProvideConstructiveFeedbackOutput> {
  return provideConstructiveFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideConstructiveFeedbackPrompt',
  input: {schema: ProvideConstructiveFeedbackInputSchema},
  output: {schema: ProvideConstructiveFeedbackOutputSchema},
  prompt: `You are an expert writing tutor providing constructive feedback to students.

  Provide constructive feedback on the following text. Be specific and provide actionable suggestions for improvement.

  Text: {{{text}}}

  {{#if criteria}}
  Consider the following criteria or guidelines: {{{criteria}}}
  {{/if}}`,
});

const provideConstructiveFeedbackFlow = ai.defineFlow(
  {
    name: 'provideConstructiveFeedbackFlow',
    inputSchema: ProvideConstructiveFeedbackInputSchema,
    outputSchema: ProvideConstructiveFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
