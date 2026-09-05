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
              leftIcon={<RotateCcw className="h-3.5 w-3.5 text-stone-500" />}
            >
              Clear Conversation
            </SecondaryButton>
          }
        />

        <div className="rounded border border-stone-200 bg-white shadow-2xs overflow-hidden flex flex-col h-[calc(100vh-16rem)] min-h-[500px]">
          <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-bold text-xs text-stone-900">Assistant Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
              <span>Policy Limit: 20% Max Discount</span>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <AssistantMessageBubble
                key={msg.id}
                message={msg}
              />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-stone-500 italic p-2">
                <Zap className="h-4 w-4 text-brand-700 animate-spin" />
                <span>Evaluating store inventory & policy limits...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DEFAULT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="rounded bg-white border border-stone-200 px-2.5 py-1 text-[11px] text-stone-700 hover:bg-stone-100 hover:text-stone-900 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
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
              className="flex items-center gap-2 bg-white rounded border border-stone-300 p-1 focus-within:border-brand-500"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about bundling, margin limits, or sales performance..."
                className="flex-1 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
              />
              <ActionButton
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || loading}
                icon={<Send className="h-3 w-3" />}
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
