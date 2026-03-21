'use client';
/**
 * MaternalChatbot
 * ────────────────
 * AI-powered maternal health assistant sidebar.
 * Uses google/gemini-2.0-flash-exp:free via /api/chat/maternal.
 * Receives patient context (vitals + verified docs) for grounded answers.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence }     from 'framer-motion';
import {
  Send, Loader2, Bot, User, ShieldCheck, Sparkles,
  ChevronDown, RefreshCw,
} from 'lucide-react';
import { BlockchainBadge } from './blockchain-badge';
import type { VaultDocument } from './document-vault';

interface Message {
  role:    'user' | 'assistant';
  content: string;
  id:      string;
}

interface PatientContext {
  name:          string;
  pregnancyWeek: number;
  vitals:        Record<string, unknown>;
  verifiedDocuments: Array<{ fileName: string; anchoredAt: string; txHash: string }>;
  anchored:      boolean;
}

interface MaternalChatbotProps {
  patientContext?: PatientContext;
}

const QUICK_PROMPTS = [
  'What should my blood glucose level be?',
  'Are there foods I should avoid for heart health?',
  'Is my blood pressure reading normal?',
  'What symptoms should I report to my doctor?',
];

const WELCOME: Message = {
  id:      'welcome',
  role:    'assistant',
  content: '🔐 I am analyzing your blockchain-verified records to provide this insight.\n\nHello! I\'m your Elderly Health AI Assistant. I have access to your verified medical records. How can I help you today?\n\n💡 Try asking about your vitals, nutrition, medications, or any health concerns.',
};

export function MaternalChatbot({ patientContext }: MaternalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/maternal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content })),
          patientContext,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? data.error ?? 'Sorry, I could not process your request.';

      setMessages(prev => [...prev, {
        id:      Date.now().toString() + '_ai',
        role:    'assistant',
        content: reply,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id:      Date.now().toString() + '_err',
        role:    'assistant',
        content: '🔐 I am analyzing your blockchain-verified records to provide this insight.\n\nI\'m temporarily unavailable. Please try again shortly.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const resetChat = () => setMessages([WELCOME]);

  return (
    <div className="glass-silk rounded-2xl border-white/30 flex flex-col overflow-hidden" style={{ height: collapsed ? 'auto' : '500px' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 border-b border-white/20 cursor-pointer shrink-0"
        onClick={() => setCollapsed(c => !c)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#6B8E6F22,#20B2AA22)' }}>
          <Bot className="h-5 w-5 text-[#6B8E6F]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">Elderly Health AI</p>
            <Sparkles className="h-3.5 w-3.5 text-[#6B8E6F]" />
          </div>
          <p className="text-xs text-muted-foreground">Powered by Gemini · Blockchain-verified context</p>
        </div>

        <div className="flex items-center gap-2">
          {patientContext?.anchored && (
            <BlockchainBadge status="verified" compact />
          )}
          <button onClick={e => { e.stopPropagation(); resetChat(); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Reset chat">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <motion.div animate={{ rotate: collapsed ? -90 : 0 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col flex-1 overflow-hidden">

            {/* ── Messages ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#6B8E6F] to-[#20B2AA]'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot  className="h-4 w-4 text-white" />
                      : <User className="h-4 w-4 text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'bg-white/80 border border-white/50 text-slate-800 shadow-sm'
                      : 'bg-gradient-to-br from-[#6B8E6F] to-[#20B2AA] text-white shadow-sm'
                  }`}>
                    {msg.role === 'assistant' && msg.content.includes('blockchain-verified') && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#6B8E6F]/20">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                        <span className="text-xs font-semibold text-[#10B981]">Blockchain-Verified Analysis</span>
                      </div>
                    )}
                    {msg.content.replace(/🔐 I am analyzing your blockchain-verified records to provide this insight\.\n\n/, '')}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6B8E6F] to-[#20B2AA] flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/80 border border-white/50 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-[#6B8E6F] animate-spin" />
                    <span className="text-xs text-muted-foreground">Analyzing your verified records…</span>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Quick prompts ────────────────────────────────────────── */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-[#6B8E6F]/10 text-[#6B8E6F] border border-[#6B8E6F]/25
                               rounded-full px-2.5 py-1 hover:bg-[#6B8E6F]/20 transition-colors font-medium">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ───────────────────────────────────────────────── */}
            <div className="p-3 border-t border-white/20 shrink-0">
              <div className="flex items-end gap-2 bg-white/70 border border-slate-200 rounded-xl p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your health records…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none max-h-24 scrollbar-thin"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#6B8E6F,#20B2AA)' }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Send className="h-3.5 w-3.5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
