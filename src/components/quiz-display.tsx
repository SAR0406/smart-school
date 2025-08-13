
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";

// Represents the parsed structure of a quiz question
interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

// Function to parse raw text into a structured quiz format
const parseQuizText = (text: string): QuizQuestion[] => {
    if (!text || text.trim() === '') return [];
    try {
        // First, try to parse it as a JSON object, which might be what Gemini returns
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const parsedJson = JSON.parse(jsonString);
        if (parsedJson.quiz && Array.isArray(parsedJson.quiz)) {
            return parsedJson.quiz.map((q: any) => ({
                question: q.question || '',
                options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D'],
                correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
            }));
        }
    } catch (e) {
        // If JSON parsing fails, fall back to regex for plain text
    }

    const questions: QuizQuestion[] = [];
    // This regex looks for questions, options, and an answer line.
    const questionBlocks = text.split(/\n\s*\n/);

    questionBlocks.forEach(block => {
        const questionMatch = block.match(/^(?:\d+\.\s*)?(.+?)\n/);
        const optionsMatch = Array.from(block.matchAll(/([A-Da-d][.)]\s*.+)/g));
        const answerMatch = block.match(/Answer:\s*([A-D])/i);

        if (questionMatch && optionsMatch.length >= 2 && answerMatch) {
            const questionText = questionMatch[1].trim();
            const options = optionsMatch.map(o => o[1].trim().replace(/^[A-Da-d][.)]\s*/, ''));
            const correctAnswerLetter = answerMatch[1].toUpperCase();
            const correctAnswerIndex = "ABCD".indexOf(correctAnswerLetter);
            
            if(options.length === 4 && correctAnswerIndex !== -1){
                questions.push({
                    question: questionText,
                    options,
                    correctAnswerIndex,
                });
            }
        }
    });

    return questions;
};


export function QuizDisplay({ quizText, topic }: { quizText: string, topic: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const quizData = useMemo(() => parseQuizText(quizText), [quizText]);

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
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

  // Handle loading state while text is streaming in
  if (quizData.length === 0 && quizText.length > 0) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Quiz on {topic}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating quiz...</span>
            </CardContent>
        </Card>
    );
  }
  
  // Handle case where no valid questions could be parsed
   if (quizData.length === 0 && quizText.length > 0) {
    return (
        <Card className="mt-4">
             <CardHeader>
                <CardTitle>Quiz on {topic}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">Could not parse the quiz questions from the response.</p>
                <pre className="mt-4 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{quizText}</pre>
            </CardContent>
        </Card>
    );
  }

  // Do not render anything if there's no text at all
  if (quizData.length === 0) return null;


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
                    <RadioGroup
                        onValueChange={(value) =>
                        setAnswers((prev) => ({ ...prev, [qIndex]: parseInt(value) }))
                        }
                    >
                        {q.options.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                            <Label htmlFor={`q${qIndex}o${oIndex}`}>{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                    </div>
                ))}
                
                </div>
            )}
        </CardContent>
        {!submitted && (
             <CardFooter>
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizData.length}>
                    Submit Quiz
                </Button>
            </CardFooter>
        )}
    </Card>
  );
}
