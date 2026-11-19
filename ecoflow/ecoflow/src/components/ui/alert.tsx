import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Alert({ className, variant = 'error', ...props }: HTMLAttributes<HTMLDivElement> & { variant?: 'error' | 'success' }) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-brand-100 bg-brand-50 text-brand-700',
        className,
      )}
      {...props}
    />
  )
}
