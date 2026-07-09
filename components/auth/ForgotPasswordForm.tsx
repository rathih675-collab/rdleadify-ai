"use client";

import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";
import { canShowDevOtp } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setDevOtp("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to prepare reset link.");
      return;
    }

    setNotice(data.message ?? "Password reset OTP sent.");
    setSubmittedEmail(String(data.email ?? email));
    setDevOtp(!data.emailSent && canShowDevOtp() ? String(data.devOtp ?? "") : "");
    if (data.email) {
      if (data.emailSent || !data.devOtp || !canShowDevOtp()) {
        window.location.assign(`/reset-password?email=${encodeURIComponent(String(data.email))}`);
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Request a secure 6 digit OTP to reset your workspace password.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}
      {devOtp ? (
        <AuthNotice tone="info">
          Development reset OTP:{" "}
          <span className="font-mono font-bold tracking-widest">{devOtp}</span>
          <Link
            href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
            className="mt-2 block font-semibold text-sky-100 underline"
          >
            Continue to password reset
          </Link>
        </AuthNotice>
      ) : null}

      <Field label="Email" name="email" type="email" autoComplete="email" required />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
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
