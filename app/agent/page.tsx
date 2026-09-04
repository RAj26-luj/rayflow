'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentResponse } from '@/lib/types';
import { formatINR } from '@/lib/utils';
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
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Merchant';
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
        "Hello! I am your **Revenue Assistant**.\n\nI analyze catalogue inventory, customer purchase affinity, and checkout trends to identify high-confidence growth opportunities within your store policies.\n\nAsk me about product bundling strategies, checkout recovery campaigns, or simulate policy limits.",
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
        const agentMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          agentResponse: data.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: 'An error occurred while evaluating your request. Please retry.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Connection error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageShell className="max-w-5xl">
        {/* Page Header */}
        <SectionHeader
          title="Assistant"
          description="Ask questions about catalogue performance, bundle opportunities, and campaign projections."
          badge={{ text: 'Rules Enforced', variant: 'emerald' }}
          action={
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-500 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-2xl shadow-2xs">
              <span>Max Discount: <strong>20%</strong></span>
              <span className="text-slate-300">•</span>
              <span>Budget Cap: <strong>₹50,000</strong></span>
            </div>
          }
        />

        {/* Chat Console Container */}
        <div className="flex flex-col h-[calc(100vh-18rem)] sm:h-[calc(100vh-16rem)] rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          {/* Header Sub-bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Store Assistant</div>
                <div className="text-[10px] text-slate-400">Execute actions and analysis with merchant approval</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Business Rules Active</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xs flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-2xl rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-xs rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs rounded-tl-none'
                  }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-line space-y-2 text-xs sm:text-sm">
                    {msg.content}
                  </div>

                  {/* Structured Decision Summary Card */}
                  {msg.agentResponse?.decisionSummary && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex flex-wrap items-center justify-between gap-1">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Recommendation Details
                          </span>
                          {msg.agentResponse.decisionSummary.expectedUplift && (
                            <span className="text-emerald-700 font-extrabold font-mono text-xs">
                              {msg.agentResponse.decisionSummary.expectedUplift}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                          <div>
                            <strong className="text-slate-900">Why: </strong>
                            <span>{msg.agentResponse.decisionSummary.evidence}</span>
                          </div>
                          <div>
                            <strong className="text-slate-900">Policy Evaluation: </strong>
                            <span
                              className={
                                msg.agentResponse.decisionSummary.policyCheck.passed
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-red-700 font-bold'
                              }
                            >
                              {msg.agentResponse.decisionSummary.policyCheck.details}
                            </span>
                          </div>
                          <div>
                            <strong className="text-slate-900">Recommended Action: </strong>
                            <span>{msg.agentResponse.decisionSummary.recommendedAction}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tools Executed Trace */}
                      {msg.agentResponse.toolsExecuted && msg.agentResponse.toolsExecuted.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span className="font-bold text-slate-400">Actions Checked:</span>
                          {msg.agentResponse.toolsExecuted.map((t, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-700"
                            >
                              {t.name}()
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-right text-[10px] opacity-60 font-mono">{msg.timestamp}</div>
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-xs flex-shrink-0 mt-0.5 shadow-xs">
                    {userInitials}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                  <Bot className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl bg-white border border-slate-200/80 p-3 text-xs text-slate-500 flex items-center gap-2.5 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Evaluating catalogue data & policy constraints...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Prompt Chips */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
              Suggested:
            </span>
            {DEFAULT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="flex-shrink-0 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about products, bundles, campaigns, or sales opportunities..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
              <ActionButton
                type="submit"
                disabled={!inputValue.trim() || loading}
                size="md"
                rightIcon={<Send className="h-3.5 w-3.5" />}
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

