'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ShieldCheck,
  Zap,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentResponse } from '@/lib/types';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { AssistantMessageBubble } from '@/components/ui/AssistantPanel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentResponse?: AgentResponse;
  timestamp: string;
}

const DEFAULT_PROMPTS = [
  'Find products with strong upsell potential.',
  'Why did revenue drop yesterday?',
  'Which product should I bundle with my top seller?',
  'Create an offer for customers who abandoned checkout.',
  'Simulate a 25% discount to test policy block.',
  'Show me what actions were executed today.',
];

export default function AgentPage() {
  const { data: session } = useSession();
  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'ME';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello! I am your **Revenue Assistant**.\n\nI analyze store inventory, customer purchase affinity, and checkout trends to identify high-confidence growth opportunities within your store policies.\n\nAsk me about product bundling strategies, checkout recovery campaigns, or simulate policy limits.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          type: 'merchant',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const assistantMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          agentResponse: data.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: 'Could not process query. Please check parameters.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Unable to connect to assistant service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageShell>
        <SectionHeader
          title="Revenue Assistant"
          description="Interactive assistant to evaluate opportunities, campaign rules, and margin limits."
          badge="Merchant Console"
          badgeIcon={<TrendingUp className="h-3.5 w-3.5" />}
          actions={
            <SecondaryButton
              size="sm"
              onClick={() => setMessages([messages[0]])}
              leftIcon={<RotateCcw className="h-3.5 w-3.5 text-zinc-400" />}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
            >
              Clear Conversation
            </SecondaryButton>
          }
        />

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[calc(100vh-16rem)] min-h-[500px] text-white">
          <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="font-bold text-xs text-white">Assistant Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
              <span>Policy Limit: 20% Max Discount</span>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <AssistantMessageBubble
                key={msg.id}
                message={msg}
              />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-zinc-400 italic p-2">
                <Zap className="h-4 w-4 text-violet-400 animate-spin" />
                <span>Evaluating store inventory & policy limits...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DEFAULT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="rounded-full bg-zinc-900/90 border border-zinc-800 px-3.5 py-1.5 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white whitespace-nowrap transition-all flex-shrink-0 disabled:opacity-50 backdrop-blur-md"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-1.5 focus-within:border-violet-500 transition-colors"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about bundling, margin limits, or sales performance..."
                className="flex-1 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none bg-transparent"
              />
              <ActionButton
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || loading}
                icon={<Send className="h-3.5 w-3.5" />}
              >
                Send
              </ActionButton>
            </form>
          </div>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
