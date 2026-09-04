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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentResponse, AgentToolCall } from '@/lib/types';
import { formatINR } from '@/lib/utils';

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
  'Show me what actions you took today.',
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
        "Hello! I am your **Revenue Growth Assistant**.\n\nI analyze your catalogue inventory, customer purchase affinity, and Razorpay checkout trends to formulate bounded revenue recommendations.\n\nAsk me about product bundling strategies, checkout recovery campaigns, or simulate policy limits.",
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
      <div className="flex flex-col h-[calc(100vh-14rem)] lg:h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Agent Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base">Revenue Growth Assistant</h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Policy Constrained
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1">
                Constrained by 20% discount cap and ₹50,000 budget policy bounds.
              </p>
            </div>
          </div>

          <div className="text-right hidden md:block text-xs">
            <div className="text-slate-400 font-mono text-[11px]">Max Discount Cap: 20%</div>
            <div className="text-slate-400 font-mono text-[11px]">Max Campaign: ₹50,000</div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-2xl rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line space-y-2 text-[11px] sm:text-xs">
                  {msg.content}
                </div>

                {/* Structured Decision Summary Card */}
                {msg.agentResponse?.decisionSummary && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2.5">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 flex flex-wrap items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                          Decision Summary
                        </span>
                        {msg.agentResponse.decisionSummary.expectedUplift && (
                          <span className="text-emerald-700 font-semibold">
                            {msg.agentResponse.decisionSummary.expectedUplift}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-slate-600 space-y-1">
                        <div>
                          <strong className="text-slate-800">Evidence: </strong>
                          <span>{msg.agentResponse.decisionSummary.evidence}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Policy Check: </strong>
                          <span
                            className={
                              msg.agentResponse.decisionSummary.policyCheck.passed
                                ? 'text-emerald-700 font-semibold'
                                : 'text-red-700 font-semibold'
                            }
                          >
                            {msg.agentResponse.decisionSummary.policyCheck.details}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Recommended Action: </strong>
                          <span>{msg.agentResponse.decisionSummary.recommendedAction}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tools Executed Trace */}
                    {msg.agentResponse.toolsExecuted && msg.agentResponse.toolsExecuted.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-400">Tools:</span>
                        {msg.agentResponse.toolsExecuted.map((t, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-100 px-1.5 py-0.2 border border-slate-200 text-slate-700"
                          >
                            {t.name}()
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-1.5 text-right text-[9px] opacity-60">{msg.timestamp}</div>
              </div>

              {msg.role === 'user' && (
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs flex-shrink-0 mt-0.5">
                  {userInitials}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 sm:gap-3 justify-start items-center">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-2.5 sm:p-3 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span>Evaluating catalogue affinity, intent & policy rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompt Chips */}
        <div className="p-2 sm:p-3 bg-slate-100 border-t border-slate-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
            Suggested:
          </span>
          {DEFAULT_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="flex-shrink-0 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Revenue Agent (e.g. 'Find products with strong upsell potential')..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="rounded-xl bg-blue-600 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
            >
              <span className="hidden xs:inline">Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
