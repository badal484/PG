import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="grid gap-2 text-sm font-medium text-text-primary" htmlFor={inputId}>
        {label}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-11 rounded-sm border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-text-tertiary focus:border-primary focus:ring-4 focus:ring-primary/10",
            error && "border-error focus:border-error focus:ring-error/10",
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-error">{error}</span> : hint ? <span className="text-xs text-text-secondary">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = "Input";

export function PhoneInput(props: Omit<InputProps, "type">) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{props.label}</span>
      <div className="flex overflow-hidden rounded-sm border border-border bg-surface focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <span className="grid h-11 place-items-center border-r border-border px-3 text-sm font-semibold text-text-secondary">+91</span>
        <input className="h-11 min-w-0 flex-1 px-3 text-sm outline-none" maxLength={10} inputMode="tel" {...props} aria-label={props.label ?? "Phone number"} />
      </div>
      {props.error ? <span className="text-xs text-error">{props.error}</span> : null}
    </div>
  );
}

export function CurrencyInput(props: Omit<InputProps, "type">) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{props.label}</span>
      <div className="flex overflow-hidden rounded-sm border border-border bg-surface focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <span className="grid h-12 place-items-center border-r border-border px-4 text-lg font-bold">₹</span>
        <input className="h-12 min-w-0 flex-1 px-3 text-lg font-semibold outline-none" inputMode="numeric" {...props} aria-label={props.label ?? "Amount"} />
      </div>
    </div>
  );
}
