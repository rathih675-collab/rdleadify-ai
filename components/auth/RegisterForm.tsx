"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import PasswordStrength, { passwordScore } from "@/components/auth/PasswordStrength";
import Turnstile from "@/components/auth/Turnstile";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setNotice("");
    setLoading(true);

    const formData = new FormData(form);
    const currentPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (currentPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwordScore(currentPassword) < 5) {
      setError("Password must include uppercase, lowercase, number, special character, and at least 8 characters.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        workspaceName: formData.get("workspaceName"),
        password: currentPassword,
        acceptedTerms,
        acceptedPrivacy,
        captchaToken,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to create account.");
      return;
    }

    setNotice(data.message ?? "Account created.");
    setPassword("");
    form.reset();
    window.location.assign(`/verify-email?email=${encodeURIComponent(String(data.email ?? ""))}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Start workspace
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Register your CRM</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The first user becomes Super Admin for the workspace.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

      <Field label="Full name" name="name" autoComplete="name" required />
      <Field label="Work email" name="email" type="email" autoComplete="email" required />
      <Field label="Workspace name" name="workspaceName" required />
      <PasswordField
        label="Password"
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
      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/25 p-4">
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-emerald-300 hover:text-emerald-200">
              Terms of Service
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(event) => setAcceptedPrivacy(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="text-emerald-300 hover:text-emerald-200">
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>
      <Turnstile onVerify={setCaptchaToken} />

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !acceptedTerms || !acceptedPrivacy || !captchaToken}
      >
        <UserPlus className="h-4 w-4" />
        {loading ? "Creating account..." : "Register"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Login
        </Link>
      </p>
    </form>
  );
}
