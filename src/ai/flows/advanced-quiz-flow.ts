
'use server';
/**
 * @fileOverview A more advanced quiz generator flow using Gemini.
 * It allows for specifying the number of questions, question type,
 * and custom instructions.
 */
import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

const AdvancedQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
  questionType: z
    .enum(['multiple_choice', 'true_false', 'short_answer'])
    .describe('The type of questions to generate.'),
  customInstructions: z
    .string()
    .optional()
    .describe('Any custom instructions for the quiz generation.'),
});
export type AdvancedQuizInput = z.infer<typeof AdvancedQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
});

const AdvancedQuizOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema),
});
export type AdvancedQuizOutput = z.infer<typeof AdvancedQuizOutputSchema>;

const quizGenerationPrompt = ai.definePrompt({
    name: 'advancedQuizPrompt',
    input: { schema: AdvancedQuizInputSchema },
    output: { schema: AdvancedQuizOutputSchema },
    model: gemini15Flash,
    prompt: `
      Generate a quiz based on the following criteria:
      Topic: {{{topic}}}
      Number of Questions: {{{numQuestions}}}
      Question Type: {{{questionType}}}
      {{#if customInstructions}}
      Custom Instructions: {{{customInstructions}}}
      {{/if}}

      The quiz should follow the provided output JSON schema precisely.
      For multiple choice questions, provide 4 options.
      For true/false, options should be "True" and "False".
      For short answer, the 'options' array can be empty.
    `,
});


const generateAdvancedQuizFlow = ai.defineFlow(
  {
    name: 'generateAdvancedQuizFlow',
    inputSchema: AdvancedQuizInputSchema,
    outputSchema: AdvancedQuizOutputSchema,
  },
  async (input) => {
    const llmResponse = await quizGenerationPrompt(input);
    return llmResponse.output!;
  }
);


export async function generateAdvancedQuiz(input: AdvancedQuizInput): Promise<AdvancedQuizOutput> {
  return await generateAdvancedQuizFlow(input);
}
