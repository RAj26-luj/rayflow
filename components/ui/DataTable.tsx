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
          'rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden',
          className
        )
      )}
    >
      {/* Desktop Table View (≥ md screen) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={clsx('px-5 py-3.5', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id ? String(row.id) : rowIdx}
                className="hover:bg-slate-50/60 transition-colors"
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
      <div className="md:hidden divide-y divide-slate-100 p-2">
        {data.map((row, rowIdx) => (
          <div
            key={row.id ? String(row.id) : rowIdx}
            className="p-4 rounded-2xl bg-white space-y-2.5 my-1"
          >
            {columns.map((col, colIdx) => {
              const content = col.cell
                ? col.cell(row)
                : col.accessorKey
                ? String(row[col.accessorKey] ?? '')
                : null;

              if (col.mobileTitle) {
                return (
                  <div key={colIdx} className="font-bold text-slate-900 text-sm pb-1 border-b border-slate-100">
                    {content}
                  </div>
                );
              }

              return (
                <div key={colIdx} className="flex items-start justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                    {col.header}:
                  </span>
                  <div className="text-right text-slate-800 font-medium">{content}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
