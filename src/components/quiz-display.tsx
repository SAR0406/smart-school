"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function QuizDisplay({ quizData, topic }: { quizData: any[], topic: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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

  return (
    <div className="space-y-4">
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
          <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizData.length}>
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
