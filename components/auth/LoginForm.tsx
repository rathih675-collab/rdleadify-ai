"use client";

import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

export default function LoginForm({ successMessage = "" }: { successMessage?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const submittingRef = useRef(false);

  async function readResponse(response: Response) {
    const text = await response.text();
    if (!text.trim()) return { success: false, error: "The login service returned an empty response. Please try again." };
    try {
      return JSON.parse(text) as { success?: boolean; error?: string; redirect?: string };
    } catch {
      return { success: false, error: "The login service returned an invalid response. Please try again." };
    }
  }

  async function getTurnstileToken(signal: AbortSignal) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      if (process.env.NODE_ENV === "production") throw new Error("Security verification is not configured. Please contact support.");
      return "";
    }
    await loadTurnstileScript(signal);
    if (!window.turnstile) throw new Error("Security verification is unavailable. Please try again.");
    return new Promise<string>((resolve, reject) => {
      const container = document.createElement("div"); container.hidden = true; document.body.appendChild(container);
      let widgetId: string | undefined;
      const cleanup = () => { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); container.remove(); signal.removeEventListener("abort", aborted); };
      const aborted = () => { cleanup(); reject(new DOMException("Aborted", "AbortError")); };
      signal.addEventListener("abort", aborted, { once: true });
      widgetId = window.turnstile.render(container, { sitekey: siteKey, size: "invisible", callback: token => { cleanup(); resolve(token); }, "error-callback": () => { cleanup(); reject(new Error("Security verification failed. Please try again.")); }, "timeout-callback": () => { cleanup(); reject(new Error("Security verification timed out. Please try again.")); } });
      window.turnstile.execute(widgetId);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const form = new FormData(event.currentTarget);
      const captchaToken = await getTurnstileToken(controller.signal);
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: controller.signal, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe, captchaToken }) });
      const data = await readResponse(response);
      if (!response.ok || !data.success) { setError(data.error ?? (response.status >= 500 ? "The login service is temporarily unavailable. Please try again." : "Unable to sign in.")); return; }
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const redirect = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : data.redirect ?? "/dashboard";
      window.location.assign(redirect);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") setError("Login request timed out. Please try again.");
      else if (cause instanceof Error) setError(cause.message || "A network error prevented login. Please try again.");
      else setError("A network error prevented login. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Login to RDLeadify AI</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Access your CRM workspace with a secure session.
        </p>
      </div>

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      {successMessage ? (
        <AuthNotice tone="success">{successMessage}</AuthNotice>
      ) : null}

      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-emerald-300 hover:text-emerald-200">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {loading ? "Signing in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        New to RDLeadify AI?{" "}
        <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
          Create account
        </Link>
      </p>
    </form>
  );
}

declare global { interface Window { turnstile?: { render: (container: HTMLElement, options: { sitekey: string; size: "invisible"; callback: (token: string) => void; "error-callback": () => void; "timeout-callback": () => void }) => string; execute: (id: string) => void; remove: (id: string) => void } } }
let turnstileScriptPromise: Promise<void> | null = null;
function loadTurnstileScript(signal: AbortSignal) {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileScriptPromise) turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-rdleadify-turnstile]');
    const script = existing ?? document.createElement("script");
    const failed = () => { turnstileScriptPromise = null; reject(new Error("Security verification could not load. Check your connection and try again.")); };
    script.addEventListener("load", () => resolve(), { once: true }); script.addEventListener("error", failed, { once: true });
    if (!existing) { script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.defer = true; script.dataset.rdleadifyTurnstile = "true"; document.head.appendChild(script); }
  });
  return Promise.race([turnstileScriptPromise, new Promise<void>((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }))]);
}
