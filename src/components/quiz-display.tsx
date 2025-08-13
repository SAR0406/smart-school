
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";

// Helper function to safely parse stringified JSON
const safelyParseJson = (jsonString: string): any | null => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
};

interface QuizQuestion {
    question: string;
    options?: string[];
    correctAnswer: string;
}

interface AdvancedQuizOutput {
    quiz: QuizQuestion[];
}


interface QuizDisplayProps {
  // Can accept either a structured object or a raw string for backward compatibility
  quizData?: AdvancedQuizOutput | null;
  quizText?: string | null;
  topic: string;
}

// The main component
export function QuizDisplay({ quizData: initialQuizData, quizText, topic }: QuizDisplayProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Memoize the parsed quiz data to avoid re-computation
  const quizData: QuizQuestion[] | null = useMemo(() => {
    let dataToParse = initialQuizData;

    // If we receive text, try to parse it
    if (quizText) {
        const parsed = safelyParseJson(quizText);
        if (parsed && parsed.quiz) {
            dataToParse = parsed;
        }
    }
    
    if (dataToParse && Array.isArray(dataToParse.quiz)) {
      return dataToParse.quiz;
    }

    return null;
  }, [initialQuizData, quizText]);

  // Handle loading state
  if (!quizData) {
     if (quizText === null || quizText === undefined) return null; // Don't render if there's no data at all

     return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Quiz on {topic}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Parsing quiz...</span>
            </CardContent>
        </Card>
    );
  }

  // Handle case where parsing failed
  if (quizData.length === 0) {
     return (
        <Card className="mt-4">
             <CardHeader>
                <CardTitle>Quiz on {topic}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">Could not parse the quiz questions from the AI's response.</p>
                {quizText && <pre className="mt-4 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{quizText}</pre>}
            </CardContent>
        </Card>
    );
  }

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleRestart = () => {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
  }

  return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Quiz on {topic}</CardTitle>
            {!submitted && <CardDescription>Answer the questions below.</CardDescription>}
        </CardHeader>
        <CardContent>
            {submitted ? (
                <div className="text-center space-y-4 p-4">
                    <h4 className="text-xl font-bold">Quiz Complete!</h4>
                    <p className="text-muted-foreground">You scored</p>
                    <div className="relative w-32 h-32 mx-auto my-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-primary/20"
                                strokeWidth="10"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                            />
                            <circle
                                className="text-primary"
                                strokeWidth="10"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - score / quizData.length)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{score}/{quizData.length}</span>
                        </div>
                    </div>
                    <Button onClick={handleRestart}>Try Again</Button>
                </div>
            ) : (
                <div className="space-y-6">
                {quizData.map((q, qIndex) => (
                    <div key={qIndex}>
                        <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
                        {q.options && q.options.length > 0 ? (
                             <RadioGroup
                                onValueChange={(value) =>
                                setAnswers((prev) => ({ ...prev, [qIndex]: value }))
                                }
                                value={answers[qIndex]}
                            >
                                {q.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`q${qIndex}o${oIndex}`} />
                                        <Label htmlFor={`q${qIndex}o${oIndex}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <p className="text-sm text-muted-foreground">This is a short answer question. The answer will be revealed after submission.</p>
                        )}
                    </div>
                ))}
                </div>
            )}
        </CardContent>
        {!submitted && (
             <CardFooter>
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizData.filter(q => q.options && q.options.length > 0).length}>
                    Submit Quiz
                </Button>
            </CardFooter>
        )}
    </Card>
  );
}
