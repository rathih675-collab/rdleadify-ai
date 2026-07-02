"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import PasswordStrength, { passwordScore } from "@/components/auth/PasswordStrength";
import Turnstile from "@/components/auth/Turnstile";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setNotice("");
    setLoading(true);

    const formData = new FormData(form);
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwordScore(password) < 5) {
      setError("Password must include uppercase, lowercase, number, special character, and at least 8 characters.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password, captchaToken }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to reset password.");
      return;
    }

    setNotice(data.message ?? "Password reset successfully.");
    setOtp("");
    setPassword("");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Secure password reset
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Enter the OTP from your email and choose a stronger password.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

      <Field
        label="Email"
        name="email"
        type="email"
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
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <PasswordStrength password={password} />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Turnstile onVerify={setCaptchaToken} />

      <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
        <KeyRound className="h-4 w-4" />
        {loading ? "Resetting..." : "Reset password"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Back to{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          login
        </Link>
      </p>
    </form>
  );
}
