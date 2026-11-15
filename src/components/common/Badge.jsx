import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ children, variant = 'default', size = 'sm', className }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  switch (s) {
    case 'PRESENT':
    case 'VERIFIED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'TRUE':
      return <Badge variant="success">{s}</Badge>;
    case 'SCHEDULED':
    case 'PENDING':
      return <Badge variant="warning">{s}</Badge>;
    case 'ONGOING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ONGOING
        </span>
      );
    case 'ABSENT':
    case 'FAILED':
    case 'CANCELLED':
    case 'FALSE':
      return <Badge variant="danger">{s}</Badge>;
    case 'LATE':
      return <Badge variant="warning">LATE</Badge>;
    default:
      return <Badge variant="default">{s}</Badge>;
  }
}
