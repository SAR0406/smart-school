
'use server';
/**
 * @fileOverview A flow to analyze an image of a document and answer a question about it.
 */
import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

const ScannerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The user\'s question or instruction about the document.'),
});
export type ScannerInput = z.infer<typeof ScannerInputSchema>;

const ScannerOutputSchema = z.string().describe('The AI\'s response to the user\'s prompt based on the document image.');
export type ScannerOutput = z.infer<typeof ScannerOutputSchema>;


const scannerPrompt = ai.definePrompt({
    name: 'documentScannerPrompt',
    input: { schema: ScannerInputSchema },
    output: { format: 'text' },
    model: gemini15Flash,
    prompt: `You are an expert document analysis assistant.
    You must start every response with a relevant emoji.
    Analyze the attached image of a document and follow the user's instructions precisely.
    User instruction: {{{prompt}}}
    Document Photo: {{media url=photoDataUri}}`,
});

const scannerFlow = ai.defineFlow(
  {
    name: 'scannerFlow',
    inputSchema: ScannerInputSchema,
    outputSchema: ScannerOutputSchema,
  },
  async (input) => {
    const llmResponse = await scannerPrompt(input);
    return llmResponse.text;
  }
);

export async function processDocument(input: ScannerInput): Promise<ScannerOutput> {
  const result = await scannerFlow(input);
  if (!result) {
    throw new Error("The AI failed to process the document. Please try again.");
  }
  return result;
}
