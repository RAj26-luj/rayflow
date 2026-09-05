'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  mobileTitle?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyState,
  className,
}: {
  columns: Column<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  className?: string;
}) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl overflow-hidden text-white',
          className
        )
      )}
    >
      {/* Desktop Table View (≥ md screen) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800/80 bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={clsx('px-5 py-3.5', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id ? String(row.id) : rowIdx}
                className="hover:bg-zinc-800/50 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={clsx('px-5 py-4 align-middle', col.className)}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< md screen) */}
      <div className="md:hidden divide-y divide-zinc-800/60 p-2">
        {data.map((row, rowIdx) => (
          <div
            key={row.id ? String(row.id) : rowIdx}
            className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-2.5 my-1"
          >
            {columns.map((col, colIdx) => {
              const content = col.cell
                ? col.cell(row)
                : col.accessorKey
                ? String(row[col.accessorKey] ?? '')
                : null;

              if (col.mobileTitle) {
                return (
                  <div key={colIdx} className="font-bold text-white text-sm pb-1 border-b border-zinc-800/80">
                    {content}
                  </div>
                );
              }

              return (
                <div key={colIdx} className="flex items-start justify-between gap-2 text-xs">
                  <span className="text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
                    {col.header}:
                  </span>
                  <div className="text-right text-zinc-200 font-medium">{content}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
