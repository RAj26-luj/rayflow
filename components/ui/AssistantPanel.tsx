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
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold flex-shrink-0 mt-0.5 shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={clsx(
          'max-w-[85%] rounded-3xl p-4 leading-relaxed shadow-xs',
          isUser
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
        )}
      >
        <div className="whitespace-pre-line space-y-2">{message.content}</div>

        {/* Structured Decision Summary (for Merchant Agent) */}
        {message.decisionSummary && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] space-y-2 text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Policy & Action Summary
              </span>
              <span
                className={clsx(
                  'font-bold flex items-center gap-1',
                  message.decisionSummary.policyCheck.passed ? 'text-emerald-700' : 'text-red-700'
                )}
              >
                {message.decisionSummary.policyCheck.passed ? 'Within Policy ✓' : 'Blocked By Policy ✗'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Why: </span>
              <span>{message.decisionSummary.evidence}</span>
            </div>
            <div>
              <span className="text-slate-500">Action: </span>
              <strong className="text-slate-900">{message.decisionSummary.recommendedAction}</strong>
            </div>
            {message.decisionSummary.expectedUplift && (
              <div className="text-emerald-700 font-semibold font-mono">
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
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">{prod.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">₹{prod.price?.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => onAddProduct(prod)}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 transition-colors flex-shrink-0"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Curated Bundle Recommendation */}
        {message.recommendedBundle && onAddBundle && (
          <div className="mt-3 rounded-2xl bg-indigo-50 border border-indigo-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
              <span>Curated Bundle Offer</span>
              <span className="text-emerald-700">Save ₹{message.recommendedBundle.savingsAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              Bundle Total: ₹{message.recommendedBundle.bundlePrice?.toLocaleString('en-IN')}
            </div>
            <button
              onClick={() => onAddBundle(message.recommendedBundle)}
              className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
            >
              Add Full Bundle to Cart
            </button>
          </div>
        )}

        {/* Suggested Replies */}
        {message.suggestedReplies && message.suggestedReplies.length > 0 && onReplyClick && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
            {message.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onReplyClick(reply)}
                className="rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-3 py-1 text-[11px] text-slate-700 transition-all"
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
