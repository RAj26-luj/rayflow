'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  recommendedBundle?: any;
  suggestedReplies?: string[];
  decisionSummary?: {
    intent: string;
    evidence: string;
    policyCheck: {
      passed: boolean;
      details: string;
    };
    recommendedAction: string;
    expectedUplift?: string;
  };
  timestamp?: string;
}

export function AssistantMessageBubble({
  message,
  onReplyClick,
  onAddBundle,
  onAddProduct,
  className,
}: {
  message: AssistantMessage;
  onReplyClick?: (text: string) => void;
  onAddBundle?: (bundle: any) => void;
  onAddProduct?: (product: any) => void;
  className?: string;
}) {
  const isUser = message.role === 'user';

  return (
    <div
      className={twMerge(
        clsx(
          'flex gap-3 text-xs',
          isUser ? 'justify-end' : 'justify-start',
          className
        )
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-white font-bold flex-shrink-0 mt-0.5 shadow-md shadow-violet-950/50 border border-violet-400/30">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-[85%] rounded-3xl p-4 leading-relaxed shadow-lg backdrop-blur-xl',
          isUser
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs font-medium shadow-violet-950/40'
            : 'bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-bl-xs'
        )}
      >
        <div className="whitespace-pre-line space-y-2">{message.content}</div>

        {/* Structured Decision Summary */}
        {message.decisionSummary && (
          <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] space-y-2 text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                Rule Check
              </span>
              <span
                className={clsx(
                  'font-semibold flex items-center gap-1',
                  message.decisionSummary.policyCheck.passed ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {message.decisionSummary.policyCheck.passed ? 'Approved ✓' : 'Blocked ✗'}
              </span>
            </div>
            <div>
              <span className="text-zinc-400">Why: </span>
              <span>{message.decisionSummary.evidence}</span>
            </div>
            <div>
              <span className="text-zinc-400">Action: </span>
              <strong className="text-white">{message.decisionSummary.recommendedAction}</strong>
            </div>
            {message.decisionSummary.expectedUplift && (
              <div className="text-emerald-400 font-semibold font-mono">
                {message.decisionSummary.expectedUplift}
              </div>
            )}
          </div>
        )}

        {/* Product Recommendations */}
        {message.products && message.products.length > 0 && onAddProduct && (
          <div className="mt-3 space-y-2">
            {message.products.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs truncate">{prod.name}</div>
                  <div className="text-[11px] text-violet-300 font-mono">₹{prod.price?.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => onAddProduct(prod)}
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0 shadow-xs"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bundle Deal */}
        {message.recommendedBundle && onAddBundle && (
          <div className="mt-3 rounded-2xl bg-violet-950/60 border border-violet-800/60 p-3 space-y-2 text-white">
            <div className="flex items-center justify-between text-[11px] font-semibold text-violet-300">
              <span>Bundle Deal</span>
              <span className="text-emerald-400">Save ₹{message.recommendedBundle.savingsAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-xs font-semibold text-white">
              Total: ₹{message.recommendedBundle.bundlePrice?.toLocaleString('en-IN')}
            </div>
            <button
              onClick={() => onAddBundle(message.recommendedBundle)}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
            >
              Add Bundle to Cart
            </button>
          </div>
        )}

        {/* Suggested Replies */}
        {message.suggestedReplies && message.suggestedReplies.length > 0 && onReplyClick && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
            {message.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onReplyClick(reply)}
                className="rounded-full bg-zinc-800/90 hover:bg-violet-950 hover:text-violet-300 hover:border-violet-700/80 border border-zinc-700/80 px-3 py-1 text-[11px] text-zinc-200 transition-all backdrop-blur-md"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
