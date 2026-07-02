"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setVerificationToken("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        workspaceName: form.get("workspaceName"),
        password: form.get("password"),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to create account.");
      return;
    }

    setNotice(data.message ?? "Account created.");
    if (data.verificationToken) setVerificationToken(data.verificationToken);
    event.currentTarget.reset();
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
      {notice ? (
        <AuthNotice tone="success">
          {notice}
          {verificationToken ? (
            <span className="mt-2 block break-all text-xs text-emerald-50/90">
              Dev verification token: {verificationToken}
            </span>
          ) : null}
        </AuthNotice>
      ) : null}

      <Field label="Full name" name="name" autoComplete="name" required />
      <Field label="Work email" name="email" type="email" autoComplete="email" required />
      <Field label="Workspace name" name="workspaceName" required />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        minLength={10}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
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
