'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating detailed study notes on a given subject.
 *
 * - generateDetailedStudyNotes - A function that generates detailed study notes.
 * - GenerateDetailedStudyNotesInput - The input type for the generateDetailedStudyNotes function.
 * - GenerateDetailedStudyNotesOutput - The return type for the generateDetailedStudyNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedStudyNotesInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate study notes.'),
  topic: z.string().describe('The specific topic within the subject to focus on.'),
  desiredLength: z
    .string()
    .describe(
      'The desired length of the study notes, such as concise, detailed, or comprehensive.'
    ),
});
export type GenerateDetailedStudyNotesInput = z.infer<typeof GenerateDetailedStudyNotesInputSchema>;

const GenerateDetailedStudyNotesOutputSchema = z.object({
  studyNotes: z.string().describe('The generated detailed study notes.'),
});
export type GenerateDetailedStudyNotesOutput = z.infer<typeof GenerateDetailedStudyNotesOutputSchema>;

export async function generateDetailedStudyNotes(
  input: GenerateDetailedStudyNotesInput
): Promise<GenerateDetailedStudyNotesOutput> {
  return generateDetailedStudyNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedStudyNotesPrompt',
  input: {schema: GenerateDetailedStudyNotesInputSchema},
  output: {schema: GenerateDetailedStudyNotesOutputSchema},
  prompt: `You are an expert study assistant. Your goal is to create detailed study notes for students.

  Subject: {{{subject}}}
  Topic: {{{topic}}}
  Desired Length: {{{desiredLength}}}

  Please generate detailed study notes on the specified topic within the given subject. The study notes should be well-organized, comprehensive, and suitable for exam preparation.`,
});

const generateDetailedStudyNotesFlow = ai.defineFlow(
  {
    name: 'generateDetailedStudyNotesFlow',
    inputSchema: GenerateDetailedStudyNotesInputSchema,
    outputSchema: GenerateDetailedStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
