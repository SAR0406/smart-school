
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const TOUR_STORAGE_KEY = 'schoolzen_onboarding_tour_completed';

const tourSteps = [
  {
    id: 'dashboard',
    title: 'Welcome to SchoolZen!',
    content: 'This is your dashboard. Here you can track your progress and see your schedule at a glance.',
  },
  {
    id: 'ai-tools',
    title: 'AI Tools',
    content: 'Explore a suite of AI-powered tools to help you with your studies, from generating notes to creating quizzes.',
  },
  {
    id: 'scanner',
    title: 'Document Scanner',
    content: 'Use your camera to scan documents and get instant summaries, translations, or answers about the content.',
  },
  {
    id: 'gemini',
    title: 'Gemini AI',
    content: 'Leverage Google\'s powerful Gemini model for advanced chat and custom quiz generation.',
  },
];

interface OnboardingTourProps {
  refs: {
    [key: string]: React.RefObject<HTMLElement>;
  };
}

export function OnboardingTour({ refs }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isTourActive, setIsTourActive] = useState(false);
  
  useEffect(() => {
    try {
      const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompletedTour) {
        // Delay starting the tour slightly to allow the UI to settle
        const timer = setTimeout(() => {
            setIsTourActive(true);
            setCurrentStep(0);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setIsTourActive(false);
    setCurrentStep(-1);
  };
  
  if (!isTourActive || currentStep === -1) {
    return null;
  }

  const step = tourSteps[currentStep];
  const targetRef = refs[step.id];

  if (!targetRef?.current) {
    // If the target element for the current step is not rendered,
    // either skip to the next step or end the tour.
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
    return null;
  }


  return (
    <>
      {tourSteps.map((s, index) => {
        const ref = refs[s.id];
        if (!ref?.current) return null;
        return (
          <Tooltip key={s.id} open={isTourActive && currentStep === index}>
            <TooltipTrigger asChild>
                <div 
                    style={{
                        position: 'fixed',
                        top: ref.current.getBoundingClientRect().top,
                        left: ref.current.getBoundingClientRect().left,
                        width: ref.current.getBoundingClientRect().width,
                        height: ref.current.getBoundingClientRect().height,
                        pointerEvents: 'none',
                        zIndex: 100,
                    }}
                />
            </TooltipTrigger>
            <TooltipContent side="right" align="start" className="max-w-xs shadow-lg z-[101]">
              <div className="p-2">
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{index + 1} / {tourSteps.length}</span>
                    <Button onClick={handleNext} size="sm">
                        {index === tourSteps.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
