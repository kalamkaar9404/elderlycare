'use client';

/**
 * Elderly-Friendly UI Wrapper Component
 * 
 * Provides enhanced accessibility features for elderly users:
 * - Larger text and touch targets
 * - High contrast colors
 * - Simplified navigation
 * - Reduced motion options
 * - Clear visual hierarchy
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ElderlyWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ElderlyWrapper({ children, className }: ElderlyWrapperProps) {
  return (
    <div className={cn('elderly-mode', className)}>
      {children}
    </div>
  );
}

interface ElderlyCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export function ElderlyCard({ children, className, title, icon }: ElderlyCardProps) {
  return (
    <div className={cn('elderly-card', className)}>
      {title && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="elderly-icon-lg text-[#6B8E6F]">{icon}</div>}
          <h3 className="text-elderly-xl font-bold text-[#6B8E6F]">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

interface ElderlyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'large';
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export function ElderlyButton({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  className,
  disabled = false,
  icon,
}: ElderlyButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-3 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-4 focus-visible:outline-[#20B2AA] focus-visible:outline-offset-4';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA] text-white hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white text-[#6B8E6F] border-2 border-[#6B8E6F] hover:bg-[#6B8E6F]/10',
    outline: 'bg-transparent text-[#6B8E6F] border-2 border-[#6B8E6F] hover:bg-[#6B8E6F]/5',
  };
  
  const sizeStyles = {
    default: 'min-h-[48px] px-6 py-3 text-elderly-sm',
    large: 'min-h-[56px] px-8 py-4 text-elderly-base',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        className
      )}
    >
      {icon && <span className="elderly-icon-md">{icon}</span>}
      {children}
    </button>
  );
}

interface ElderlyBadgeProps {
  children: ReactNode;
  status: 'safe' | 'attention' | 'urgent';
  className?: string;
}

export function ElderlyBadge({ children, status, className }: ElderlyBadgeProps) {
  const statusStyles = {
    safe: 'elderly-badge-safe',
    attention: 'elderly-badge-attention',
    urgent: 'elderly-badge-urgent',
  };
  
  return (
    <span className={cn('elderly-badge', statusStyles[status], className)}>
      {children}
    </span>
  );
}

interface ElderlySectionProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  className?: string;
}

export function ElderlySection({ children, title, icon, className }: ElderlySectionProps) {
  return (
    <section className={cn('elderly-section', className)}>
      <div className="flex items-center gap-3 elderly-section-title">
        {icon && <span className="elderly-icon-lg">{icon}</span>}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

interface ElderlyAlertProps {
  children: ReactNode;
  type: 'error' | 'success' | 'info';
  className?: string;
}

export function ElderlyAlert({ children, type, className }: ElderlyAlertProps) {
  const typeStyles = {
    error: 'elderly-error',
    success: 'elderly-success',
    info: 'bg-[#E0F7F5] border-[#20B2AA] text-[#0D7A72]',
  };
  
  return (
    <div className={cn(typeStyles[type], 'rounded-xl p-6 border-3', className)}>
      {children}
    </div>
  );
}

interface ElderlyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  className?: string;
}

export function ElderlyInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: ElderlyInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-elderly-base font-semibold text-[#6B8E6F]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[48px] px-4 py-3 text-elderly-sm border-2 border-[#6B8E6F]/30 rounded-xl focus:border-[#20B2AA] focus:outline-4 focus:outline-[#20B2AA]/25 focus:outline-offset-2 transition-all"
      />
    </div>
  );
}

interface ElderlyNavItemProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ElderlyNavItem({
  label,
  icon,
  active = false,
  onClick,
  className,
}: ElderlyNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'elderly-nav-item w-full',
        active && 'active',
        className
      )}
    >
      <span className="elderly-icon-md">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
