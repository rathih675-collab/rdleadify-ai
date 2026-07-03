"use client";

import Link from "next/link";
import { BadgeCheck, Loader2, RefreshCw } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";
import { canShowDevOtp } from "@/lib/auth-client";

export default function VerifyEmailForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to verify email.");
      return;
    }

    window.location.assign("/login?verified=1");
  }

  async function resendOtp() {
    setError("");
    setNotice("");
    setDevOtp("");
    setResending(true);

    const response = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setResending(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to resend OTP.");
      return;
    }

    setNotice(data.message ?? "OTP sent to your email. Please check your inbox.");
    setDevOtp(!data.emailSent && canShowDevOtp() ? String(data.devOtp ?? "") : "");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Email OTP verification
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Verify your email</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Enter the 6 digit OTP sent to your inbox. It expires in 10 minutes.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}
      {devOtp ? (
        <AuthNotice tone="info">
          Development OTP: <span className="font-mono font-bold tracking-widest">{devOtp}</span>
        </AuthNotice>
      ) : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Field
        label="6 digit OTP"
        name="otp"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        className="text-center font-mono text-xl tracking-[0.5em]"
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
          {loading ? "Verifying..." : "Verify"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={resendOtp}
          disabled={resending}
        >
          {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {resending ? "Sending..." : "Resend OTP"}
        </Button>
      </div>

      <p className="text-center text-sm text-slate-400">
        Ready to continue?{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Login
        </Link>
      </p>
    </form>
  );
}
