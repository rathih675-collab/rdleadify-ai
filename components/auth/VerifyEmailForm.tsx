"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthNotice, Field } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

export default function VerifyEmailForm({ initialToken = "" }: { initialToken?: string }) {
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
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: form.get("token") }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to verify email.");
      return;
    }

    setNotice(data.message ?? "Email verified successfully.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Email verification
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Verify email</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Activate secure login for your RDLeadify workspace.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

      <Field
        label="Verification token"
        name="token"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        <BadgeCheck className="h-4 w-4" />
        {loading ? "Verifying..." : "Verify email"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Ready to continue?{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Login
        </Link>
      </p>
    </form>
  );
}
