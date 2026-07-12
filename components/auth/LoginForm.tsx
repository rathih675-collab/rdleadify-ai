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
    console.info("[login] response body", { body: text || "<empty>" });
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
      throw new Error("Security verification is not configured. Please contact support.");
    }
    await loadTurnstileScript(signal);
    return new Promise<string>((resolve, reject) => {
      const turnstile = window.turnstile;
      if (!turnstile) {
        reject(new Error("Captcha is still loading. Please try again."));
        return;
      }
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const containerRoot = document.body;
      if (!containerRoot) {
        reject(new Error("Captcha could not start. Please try again."));
        return;
      }
      const container = document.createElement("div");
      container.hidden = true;
      containerRoot.appendChild(container);
      let widgetId: string | undefined;
      let settled = false;
      const cleanup = () => {
        try {
          if (widgetId) turnstile.remove(widgetId);
        } catch {
          // Cleanup must never prevent the login promise from settling.
        }
        container.remove();
        signal.removeEventListener("abort", aborted);
      };
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      const aborted = () => fail(new DOMException("Aborted", "AbortError"));
      signal.addEventListener("abort", aborted, { once: true });
      try {
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          size: "invisible",
          callback: token => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(token);
          },
          "error-callback": () => fail(new Error("Security verification failed. Please try again.")),
          "timeout-callback": () => fail(new Error("Security verification timed out. Please try again.")),
        });
        if (!widgetId) throw new Error("Security verification could not start. Please try again.");
        turnstile.execute(widgetId);
      } catch {
        fail(new Error("Security verification could not start. Please try again."));
      }
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    console.info("[login] submit started");
    submittingRef.current = true;
    setError("");
    setLoading(true);
    const requestController = new AbortController();
    const captchaController = new AbortController();
    let requestTimedOut = false;
    let captchaTimedOut = false;
    const abortCaptcha = () => captchaController.abort();
    requestController.signal.addEventListener("abort", abortCaptcha, { once: true });
    const requestTimeout = window.setTimeout(() => {
      requestTimedOut = true;
      requestController.abort();
    }, 15_000);
    const captchaTimeout = window.setTimeout(() => {
      captchaTimedOut = true;
      captchaController.abort();
    }, 8_000);
    try {
      const form = new FormData(event.currentTarget);
      const captchaToken = await getTurnstileToken(captchaController.signal);
      window.clearTimeout(captchaTimeout);
      console.info("[login] captcha token created");
      console.info("[login] request sent", { endpoint: "/api/auth/login" });
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: requestController.signal, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe, captchaToken }) });
      console.info("[login] response status", { status: response.status });
      const data = await readResponse(response);
      if (!response.ok || !data.success) { setError(data.error ?? (response.status >= 500 ? "The login service is temporarily unavailable. Please try again." : "Unable to sign in.")); return; }
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const redirect = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : data.redirect ?? "/dashboard";
      console.info("[login] redirect started", { redirect });
      window.location.assign(redirect);
    } catch (cause) {
      console.error("[login] error caught", { errorType: cause instanceof Error ? cause.name : "UnknownError" });
      if (captchaTimedOut) setError("Captcha could not load. Please refresh and try again.");
      else if (requestTimedOut || (cause instanceof DOMException && cause.name === "AbortError")) setError("Login request timed out. Please try again.");
      else if (cause instanceof Error) setError(cause.message || "A network error prevented login. Please try again.");
      else setError("A network error prevented login. Please try again.");
    } finally {
      window.clearTimeout(captchaTimeout);
      window.clearTimeout(requestTimeout);
      requestController.signal.removeEventListener("abort", abortCaptcha);
      captchaController.abort();
      submittingRef.current = false;
      setLoading(false);
      console.info("[login] loading reset");
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
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-rdleadify-turnstile]');
      const script = existing ?? document.createElement("script");
      const timeout = window.setTimeout(() => {
        failed(new Error("Captcha took too long to load. Please try again."));
      }, 10_000);
      const loaded = () => {
        window.clearTimeout(timeout);
        if (window.turnstile) resolve();
        else failed(new Error("Captcha is still loading. Please try again."));
      };
      const failed = (error: Error = new Error("Security verification could not load. Check your connection and try again.")) => {
        window.clearTimeout(timeout);
        turnstileScriptPromise = null;
        reject(error);
      };
      script.addEventListener("load", loaded, { once: true });
      script.addEventListener("error", () => failed(), { once: true });
      if (!existing) {
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.rdleadifyTurnstile = "true";
        document.head.appendChild(script);
      } else if (window.turnstile) {
        loaded();
      }
    });
  }
  return new Promise<void>((resolve, reject) => {
    const aborted = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", aborted, { once: true });
    turnstileScriptPromise!.then(resolve, reject).finally(() => signal.removeEventListener("abort", aborted));
  });
}
