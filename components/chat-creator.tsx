"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Bot, Loader2, Send, User } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

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
    // This is the first message the user sees, hardcoded for consistency.
    const initialPrompt = "Let's create a new product listing. To start, please tell me the story behind your creation. What makes it special?";
    
    setHistory([{ role: 'model', parts: [{ text: initialPrompt }] }]);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentMessage }] };
    let finalMessageToApi = currentMessage;

    // Logic to structure the final message to the AI
    if (!story) {
        // This is the first user reply, so it's the story
        setStory(currentMessage);
    } else {
        // This is the second user reply, so it's the price.
        // Now we have all the info we need.
        setMinPrice(Number(currentMessage));
        
        // Bundle everything into a JSON string for the API's final step.
        finalMessageToApi = JSON.stringify({
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: newHistory, message: finalMessageToApi }),
        });
        
        if (!response.ok) throw new Error("The AI chat service failed.");
        
        const data = await response.json();

        if (data.status === 'COMPLETED') {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
            toast.success("Product created successfully via chat!");
            setTimeout(() => {
                router.push('/products');
                router.refresh(); // Refresh server components on the target page
            }, 2000);
        } else {
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
        }

    } catch (error) {
        toast.error("An error occurred with the AI chat. Please try again.");
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  if (history.length === 0) {
    return (
        <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">Prefer a guided experience? Create your product by chatting with our AI assistant.</p>
            <Button onClick={startConversation} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Start Guided Chat
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
                        <p className="text-sm whitespace-pre-line">{msg.parts[0].text}</p>
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
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !currentMessage.trim()}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    </div>
  );
}