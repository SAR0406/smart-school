
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateAdvancedQuiz, AdvancedQuizInput } from "@/ai/flows/advanced-quiz-flow";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { QuizDisplay } from "./quiz-display";


const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }),
  numQuestions: z.coerce.number().min(1).max(10),
  questionType: z.enum(["multiple_choice", "true_false", "short_answer"]),
  customInstructions: z.string().optional(),
});

export function AdvancedQuizGenerator() {
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      questionType: "multiple_choice",
      customInstructions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setQuizResult(null);
    try {
      const result = await generateAdvancedQuiz(values as AdvancedQuizInput);
      setQuizResult(JSON.stringify(result));
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Quiz",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., The Roman Empire" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Focus on the Julio-Claudian dynasty." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Quiz
          </Button>
        </form>
      </Form>
      
      {quizResult && (
        <div className="mt-8">
            <QuizDisplay quizText={quizResult} topic={form.getValues('topic')} />
        </div>
      )}
    </div>
  );
}
