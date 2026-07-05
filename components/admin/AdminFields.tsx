"use client";

import { cn } from "@/lib/utils";

interface AdminFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminField({ label, children, className }: AdminFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-medium uppercase tracking-wider text-luxury-gold/70">
        {label}
      </label>
      {children}
    </div>
  );
}

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AdminInput({ label, className, ...props }: AdminInputProps) {
  return (
    <AdminField label={label}>
      <input
        {...props}
        className={cn(
          "w-full border border-luxury-gold/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-luxury-gold/50 focus:outline-none focus:ring-1 focus:ring-luxury-gold/30",
          className
        )}
      />
    </AdminField>
  );
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function AdminTextarea({ label, className, ...props }: AdminTextareaProps) {
  return (
    <AdminField label={label}>
      <textarea
        {...props}
        className={cn(
          "w-full resize-y border border-luxury-gold/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-luxury-gold/50 focus:outline-none focus:ring-1 focus:ring-luxury-gold/30",
          className
        )}
      />
    </AdminField>
  );
}
