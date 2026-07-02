"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setResetToken("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to prepare reset link.");
      return;
    }

    setNotice(data.message ?? "Reset link prepared.");
    if (data.resetToken) setResetToken(data.resetToken);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Request a one-time reset token for your workspace account.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? (
        <AuthNotice tone="success">
          {notice}
          {resetToken ? (
            <span className="mt-2 block break-all text-xs text-emerald-50/90">
              Dev reset token: {resetToken}
            </span>
          ) : null}
        </AuthNotice>
      ) : null}

      <Field label="Email" name="email" type="email" autoComplete="email" required />

      <Button type="submit" className="w-full" disabled={loading}>
        <MailCheck className="h-4 w-4" />
        {loading ? "Preparing..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Login
        </Link>
      </p>
    </form>
  );
}
