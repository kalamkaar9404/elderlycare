'use client';

/**
 * NutritionistChat
 * ─────────────────
 * Real-AI chat component for the Patient Portal.
 * Calls /api/chat/nutritionist → OpenAI gpt-4o with the Dr. NutriCare system prompt.
 *
 * Sync contract (keep in alignment with):
 *   backend/pages/patient_portal.py  → SYSTEM_PROMPT
 *   frontend/app/api/chat/nutritionist/route.ts → same SYSTEM_PROMPT
 */

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage as ChatMessageType } from '@/lib/mock-data';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface NutritionistChatProps {
  initialMessages: ChatMessageType[];
}

/** Map our local ChatMessage format → OpenAI-compatible role */
function toApiMessage(m: ChatMessageType) {
  return {
    role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  };
}

export function NutritionistChat({ initialMessages }: NutritionistChatProps) {
  const [messages, setMessages]   = useState<ChatMessageType[]>(initialMessages);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/nutritionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m.sender !== 'system')
            .map(toApiMessage),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Dr. NutriCare is unavailable: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="p-4 flex flex-col h-full min-h-[420px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
        <span className="text-lg">🧑‍⚕️</span>
        <div>
          <p className="font-semibold text-sm text-foreground">Dr. NutriCare</p>
          <p className="text-xs text-muted-foreground">AI Clinical Nutritionist</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-[#20B2AA] font-medium">
          <span className="h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
          Live AI
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-96 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <span className="text-3xl block mb-2">🩺</span>
            Hello! Tell me about your condition or ask for a personalised meal plan.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'system' ? (
              <div className="w-full text-center">
                <span className="inline-block text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                  {message.content}
                </span>
              </div>
            ) : (
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-[#6B8E6F] text-white rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm border border-border/40'
                }`}
              >
                {/* Render newlines properly */}
                {message.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary border border-border/40 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-[#6B8E6F]" />
              <span className="text-xs text-muted-foreground">Dr. NutriCare is typing…</span>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask Dr. NutriCare a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="bg-[#6B8E6F] hover:bg-[#6B8E6F]/90 text-white flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </div>
    </Card>
  );
}
