
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  capturedImage: string | null;
  onRetake: () => void;
}

export function CameraCapture({ onCapture, capturedImage, onRetake }: CameraCaptureProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startStream = useCallback(async () => {
    stopStream(); // Stop any existing stream
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(newStream);
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings.",
      });
    }
  }, [stopStream, toast]);

  useEffect(() => {
    if (!capturedImage) {
        startStream();
    } else {
        stopStream();
    }
    // Cleanup on unmount
    return () => {
      stopStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]); // Dependency on capturedImage to control stream

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/png");
        onCapture(dataUrl);
        stopStream();
      }
    }
  };

  const handleInternalRetake = () => {
    onRetake();
    startStream();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {hasCameraPermission === false ? (
              <Alert variant="destructive" className="h-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                  </AlertDescription>
              </Alert>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
            ) : (
              <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-4">
          {capturedImage ? (
              <Button onClick={handleInternalRetake} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Photo
              </Button>
          ) : (
              <Button onClick={handleCapture} disabled={!hasCameraPermission || !stream}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
              </Button>
          )}
      </div>
    </div>
  );
}
