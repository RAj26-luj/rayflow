'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-2 border-b border-zinc-800/80 pb-2.5 overflow-x-auto no-scrollbar w-full',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all select-none focus:outline-none backdrop-blur-md',
              isActive
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-950/50 border border-violet-400/40'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-zinc-900 border border-zinc-700 text-white px-3 py-1.5 text-[11px] font-medium shadow-2xl backdrop-blur-xl pointer-events-none whitespace-nowrap"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
