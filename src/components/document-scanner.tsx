
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from 'react-dropzone';

import { CameraCapture } from "@/components/camera-capture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, FileImage, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

import { processDocument } from "@/ai/flows/scanner-flow";

const formSchema = z.object({
  prompt: z.string().min(5, { message: "Please describe what you want to do with the document." }),
  image: z.string().refine(val => val.startsWith('data:image/'), { message: "An image is required." }),
});

export function DocumentScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      image: "",
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        setImage(dataUrl);
        form.setValue('image', dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload an image file (e.g., PNG, JPG, WEBP).",
        });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: false,
      accept: { 'image/*': ['.png', '.jpeg', '.jpg', '.webp'] }
  });

  const handleCapture = (dataUrl: string) => {
    setImage(dataUrl);
    form.setValue('image', dataUrl);
  };
  
  const handleRetake = () => {
    setImage(null);
    form.setValue('image', '');
    setResult(null);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await processDocument({
        photoDataUri: values.image,
        prompt: values.prompt,
      });
      setResult(response);
    } catch (error) {
       console.error("Failed to process document:", error);
       toast({
         variant: "destructive",
         title: "Processing Error",
         description: error instanceof Error ? error.message : "An unknown error occurred.",
       });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>1. Provide a Document</CardTitle>
                    <CardDescription>
                        Use your camera to capture a document or upload an image file from your device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="camera">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="camera">Camera</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="camera" className="mt-4">
                            <CameraCapture 
                                onCapture={handleCapture}
                                capturedImage={image}
                                onRetake={handleRetake}
                            />
                        </TabsContent>
                        <TabsContent value="upload" className="mt-4">
                            {image ? (
                                <div className="space-y-4">
                                    <img src={image} alt="Uploaded document" className="w-full rounded-md border" />
                                     <Button onClick={handleRetake} variant="outline" className="w-full">
                                        <FileImage className="mr-2 h-4 w-4" />
                                        Upload a different file
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors ${isDragActive ? 'border-primary' : 'border-border'}`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                        {isDragActive ? "Drop the file here..." : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

      <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>2. Ask a Question</CardTitle>
                        <CardDescription>
                            Tell the AI what you want to do with the document you provided.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Your Prompt</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'Summarize the key points of this document.' or 'What are the main financial figures in this report?' or 'Translate this text to French.'"
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem className="hidden">
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardContent>
                         <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Process Document
                        </Button>
                    </CardContent>
                </Card>

                {isLoading && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Analyzing document...</span>
                        </CardContent>
                    </Card>
                )}
                
                {result && !isLoading && (
                    <Card className="mt-8">
                         <CardHeader>
                            <CardTitle>Result</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-full">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </CardContent>
                    </Card>
                )}

            </form>
        </Form>
      </div>
    </div>
  );
}
