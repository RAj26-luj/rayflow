'use client';

import React from 'react';
import { clsx } from 'clsx';
import {
  Sparkles,
  Footprints,
  Shirt,
  Droplets,
  Activity,
  Watch,
  Grid,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'ALL', name: 'All Products', icon: <Grid className="h-5 w-5" /> },
  { id: 'Footwear', name: 'Shoes', icon: <Footprints className="h-5 w-5" /> },
  { id: 'Apparel', name: 'Apparel', icon: <Shirt className="h-5 w-5" /> },
  { id: 'Hydration', name: 'Hydration', icon: <Droplets className="h-5 w-5" /> },
  { id: 'Recovery', name: 'Recovery', icon: <Activity className="h-5 w-5" /> },
  { id: 'Tech', name: 'Tech', icon: <Watch className="h-5 w-5" /> },
  { id: 'Accessories', name: 'Gear', icon: <Sparkles className="h-5 w-5" /> },
];

export function CategoryRail({
  selectedCategory,
  onSelectCategory,
  className,
}: {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none', className)}>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
          >
            <div
              className={clsx(
                'flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200 select-none shadow-sm',
                isSelected
                  ? 'bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-600 border-pink-400 text-white shadow-purple-500/30 scale-105'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800'
              )}
            >
              {cat.icon}
            </div>
            <span
              className={clsx(
                'text-[11px] font-semibold tracking-tight transition-colors',
                isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
              )}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
