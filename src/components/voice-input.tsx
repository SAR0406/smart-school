"use client";

import { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Speech recognition not supported
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: `Could not understand audio. Please try again. (Error: ${event.error})`
      });
      setIsListening(false);
    };

    // Cleanup on unmount
    return () => {
      recognitionRef.current?.abort();
    };
  }, [onTranscript, toast]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser does not support voice recognition."
        });
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  if (!recognitionRef.current) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleVoiceInput}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <Mic className={cn("h-5 w-5", isListening && "text-primary animate-pulse")} />
            <span className="sr-only">Use Microphone</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? "Stop Listening" : "Start Listening"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
