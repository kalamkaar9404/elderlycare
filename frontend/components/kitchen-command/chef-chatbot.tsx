'use client';

/**
 * ChefChatbot
 * ────────────
 * Real-AI chat component for the Kitchen Command portal.
 * Calls /api/chat/chef → OpenAI gpt-4o with the ChefAid system prompt.
 *
 * Sync contract (keep in alignment with):
 *   backend/pages/kitchen_command.py → CHEF_SYSTEM_PROMPT
 *   frontend/app/api/chat/chef/route.ts → same CHEF_SYSTEM_PROMPT
 */

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage as ChatMessageType } from '@/lib/mock-data';
import { Send, Loader2, AlertCircle, Zap } from 'lucide-react';

interface ChefChatbotProps {
  initialMessages: ChatMessageType[];
}

/** Quick-access prompt suggestions — mirrors backend quick buttons */
const QUICK_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: '📐 Scale Recipe',
    prompt: 'How do I scale a dal recipe from 4 servings to 200 servings? Adjust quantities and cooking time.',
  },
  {
    label: '🔄 Substitute',
    prompt: "We don't have paneer today. What can I substitute in a recipe for 150 people while keeping it nutritious?",
  },
  {
    label: '🧼 Hygiene Check',
    prompt: 'Give me a daily food hygiene and safety checklist for an NGO kitchen serving 300 meals per day.',
  },
  {
    label: '🌡️ Safe Temps',
    prompt: 'What are the safe cooking and storage temperatures for rice, lentils, and cooked vegetables in bulk service?',
  },
];

function toApiMessage(m: ChatMessageType) {
  return {
    role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  };
}

export function ChefChatbot({ initialMessages }: ChefChatbotProps) {
  const [messages, setMessages]   = useState<ChatMessageType[]>(initialMessages);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
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
      const res = await fetch('/api/chat/chef', {
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
      setError(`ChefAid is unavailable: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Card className="p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
        <span className="text-lg">👨‍🍳</span>
        <div>
          <h4 className="font-semibold text-sm text-foreground">ChefAid</h4>
          <p className="text-xs text-muted-foreground">AI Culinary Guide</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-[#20B2AA] font-medium">
          <span className="h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
          Live AI
        </span>
      </div>

      {/* Quick-prompt buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {QUICK_PROMPTS.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-border/60
                       bg-secondary/50 hover:bg-[#6B8E6F]/10 hover:border-[#6B8E6F]/40
                       text-foreground transition-colors duration-150 disabled:opacity-50"
          >
            <Zap className="inline h-3 w-3 mr-1 text-[#6B8E6F]" />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto max-h-48 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            <span className="text-2xl block mb-1">🍳</span>
            Ask about scaling, substitutions, or kitchen hygiene.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'system' ? (
              <div className="w-full text-center">
                <span className="inline-block text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-0.5">
                  {message.content}
                </span>
              </div>
            ) : (
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-[#6B8E6F] text-white rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm border border-border/40'
                }`}
              >
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
            <div className="bg-secondary border border-border/40 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-[#6B8E6F]" />
              <span className="text-xs text-muted-foreground">ChefAid is thinking…</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask ChefAid a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="text-xs h-9"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="bg-[#6B8E6F] hover:bg-[#6B8E6F]/90 text-white h-9 w-9 flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Send className="h-3 w-3" />
          }
        </Button>
      </div>
    </Card>
  );
}
