import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NutricareCardProps {
  children: React.ReactNode;
  variant?: 'teal' | 'sage' | 'amber' | 'wellness' | 'default';
  className?: string;
  title?: string;
  description?: string;
}

export function NutricareCard({
  children,
  variant = 'default',
  className,
  title,
  description,
}: NutricareCardProps) {
  const gradients = {
    teal: 'from-cyan-50 via-white to-teal-50',
    sage: 'from-green-50 via-white to-emerald-50',
    amber: 'from-amber-50 via-white to-orange-50',
    wellness: 'from-white via-cyan-50 to-green-50',
    default: 'from-white via-slate-50 to-blue-50',
  };

  const borders = {
    teal: 'border-cyan-200/30',
    sage: 'border-green-200/30',
    amber: 'border-amber-200/30',
    wellness: 'border-cyan-200/30',
    default: 'border-white/20',
  };

  const accents = {
    teal: 'accent-cyan-600',
    sage: 'accent-green-600',
    amber: 'accent-amber-600',
    wellness: 'accent-cyan-600',
    default: 'accent-slate-600',
  };

  return (
    <Card
      className={cn(
        `bg-gradient-to-br ${gradients[variant]} ${borders[variant]} shadow-lg rounded-2xl overflow-hidden relative`,
        className
      )}
    >
      {/* Decorative gradient orb */}
      <div
        className={cn(
          'absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-40 pointer-events-none',
          variant === 'teal' && 'bg-gradient-to-br from-cyan-300 to-teal-300',
          variant === 'sage' && 'bg-gradient-to-br from-green-300 to-emerald-300',
          variant === 'amber' && 'bg-gradient-to-br from-amber-300 to-orange-300',
          variant === 'wellness' && 'bg-gradient-to-br from-cyan-300 to-green-300',
          variant === 'default' && 'bg-gradient-to-br from-cyan-200 to-blue-200'
        )}
      />

      <div className="relative z-10">
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-bold text-foreground">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </Card>
  );
}
