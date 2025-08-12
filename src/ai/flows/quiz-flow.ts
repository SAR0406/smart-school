'use server';
/**
 * @fileOverview A Genkit flow for generating quizzes.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The index (0-3) of the correct answer in the options array.'),
});

const QuizOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).length(5).describe('An array of 5 quiz questions.'),
});
export type QuizOutput = z.infer<typeof QuizOutputSchema>;


const quizPrompt = ai.definePrompt({
    name: 'quizPrompt',
    input: { schema: z.string() },
    output: { schema: QuizOutputSchema },
    prompt: `Generate a 5-question multiple-choice quiz on the topic "{{input}}".`,
});


const quizFlow = ai.defineFlow(
  {
    name: 'quizFlow',
    inputSchema: z.string(),
    outputSchema: QuizOutputSchema,
  },
  async (topic) => {
    const { output } = await quizPrompt(topic);
    return output!;
  }
);

export async function generateQuiz(topic: string): Promise<QuizOutput> {
  return quizFlow(topic);
}
