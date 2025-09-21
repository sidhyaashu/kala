"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Card, CardContent } from './ui/card';

type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

type ProductDetails = {
    title: string;
    description: string;
    tags: string[];
    suggestedPrice: number;
}

export function ChatCreator({ imageUrl }: { imageUrl: string }) {
  const router = useRouter();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Store collected info
  const [story, setStory] = useState('');
  const [minPrice, setMinPrice] = useState(0);

  const startConversation = async () => {
    setIsLoading(true);
    const initialPrompt = "Let's create a new product listing. First, please tell me the story behind your creation.";
    
    // Simulate the AI's first message
    setHistory([{ role: 'model', parts: [{ text: initialPrompt }] }]);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentMessage }] };
    let finalMessage = currentMessage;

    // Logic to structure the final message to the AI
    if (!story) {
        setStory(currentMessage);
    } else {
        setMinPrice(Number(currentMessage));
        // This is the final piece of info. Bundle everything for the AI.
        finalMessage = JSON.stringify({
            story,
            minPrice: Number(currentMessage),
            imageUrl, // Include the image URL for context
        });
    }

    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setCurrentMessage('');

    try {
        const response = await fetch('/api/chat-create-product', {
            method: 'POST',
            body: JSON.stringify({ history: newHistory, message: finalMessage }),
        });
        const data = await response.json();

        if (data.status === 'COMPLETED') {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
            toast.success("Product created successfully via chat!");
            setTimeout(() => {
                router.push('/products');
                router.refresh();
            }, 2000);
        } else {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
        }

    } catch (error) {
        toast.error("An error occurred. Please try again.");
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  if (history.length === 0) {
    return (
        <div className="text-center">
            <p className="mb-4">Alternatively, create your product through a guided chat with our AI assistant.</p>
            <Button onClick={startConversation} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Start Chat with AI
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh] bg-muted/50 rounded-lg border">
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {history.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <Bot className="h-6 w-6 text-primary shrink-0" />}
                    <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'model' ? 'bg-background' : 'bg-primary text-primary-foreground'}`}>
                        <p className="text-sm">{msg.parts[0].text}</p>
                    </div>
                    {msg.role === 'user' && <User className="h-6 w-6 shrink-0" />}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <Bot className="h-6 w-6 text-primary shrink-0" />
                    <div className="p-3 rounded-lg bg-background"><Loader2 className="h-5 w-5 animate-spin" /></div>
                </div>
            )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex items-center gap-2">
            <Textarea 
                placeholder="Type your answer..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                rows={1}
                className="flex-grow resize-none"
                disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    </div>
  );
}