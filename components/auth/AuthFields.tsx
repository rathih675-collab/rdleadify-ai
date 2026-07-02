"use client";

import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        className={cn(
          "mt-2 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function PasswordField({ label, className, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <span className="relative mt-2 block">
        <input
          type={visible ? "text" : "password"}
          className={cn(
            "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

export function AuthNotice({
  tone,
  children,
}: {
  tone: "success" | "error" | "info";
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
      : tone === "error"
        ? "border-red-400/30 bg-red-400/10 text-red-100"
        : "border-sky-400/30 bg-sky-400/10 text-sky-100";

  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm leading-5", className)}>
      {children}
    </div>
  );
}
