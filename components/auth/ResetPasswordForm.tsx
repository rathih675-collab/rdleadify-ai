"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm({ initialToken = "" }: { initialToken?: string }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: form.get("token"), password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to reset password.");
      return;
    }

    setNotice(data.message ?? "Password reset successfully.");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Set new password
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Use your one-time token before it expires.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

      <Field
        label="Reset token"
        name="token"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        required
      />
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        minLength={10}
        required
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={10}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
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
