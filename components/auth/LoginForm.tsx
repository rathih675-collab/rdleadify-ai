"use client";

import Link from "next/link";
import Script from "next/script";
import { Loader2, LogIn } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const TURNSTILE_CONFIGURATION_ERROR =
  "Security verification is not configured. Please contact support.";

export default function LoginForm({ successMessage = "" }: { successMessage?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileGeneration, setTurnstileGeneration] = useState(0);
  const [turnstileScriptStatus, setTurnstileScriptStatus] = useState<"loading" | "ready" | "error">("loading");
  const submittingRef = useRef(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKeyPresent = Boolean(TURNSTILE_SITE_KEY);
    console.info("[turnstile] client configuration", { siteKeyPresent });
    if (!siteKeyPresent) setError(TURNSTILE_CONFIGURATION_ERROR);
  }, []);

  useEffect(() => {
    if (turnstileScriptStatus !== "ready") return;

    const turnstile = window.turnstile;
    const container = turnstileContainerRef.current;
    if (!turnstile || !container) return;

    let disposed = false;
    let widgetId: string | undefined;
    const requestAnotherToken = () => {
      if (disposed || !widgetId) return;
      setTurnstileToken("");
      turnstile.reset(widgetId);
      turnstile.execute(widgetId);
    };

    setTurnstileToken("");
    try {
      widgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        execution: "execute",
        action: "login",
        callback: token => {
          if (disposed) return;
          setTurnstileToken(token);
          console.info("[turnstile] token ready", { tokenPresent: Boolean(token) });
        },
        "expired-callback": requestAnotherToken,
        "error-callback": errorCode => {
          console.error("[turnstile] challenge error", { errorCode });
          setError("Security verification failed. Please try again.");
          requestAnotherToken();
          return true;
        },
        "timeout-callback": requestAnotherToken,
      });
      turnstileWidgetIdRef.current = widgetId;
      turnstile.execute(widgetId);
    } catch {
      setTurnstileToken("");
      setTurnstileScriptStatus("error");
      setError("Security verification could not start. Please refresh and try again.");
    }

    return () => {
      disposed = true;
      if (widgetId) {
        try {
          turnstile.remove(widgetId);
        } catch {
          // Widget cleanup must not interrupt navigation or retries.
        }
      }
      if (turnstileWidgetIdRef.current === widgetId) turnstileWidgetIdRef.current = null;
    };
  }, [turnstileGeneration, turnstileScriptStatus]);

  function requestFreshTurnstileToken() {
    setTurnstileToken("");
    setTurnstileGeneration(current => current + 1);
  }

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!TURNSTILE_SITE_KEY) {
      setError(TURNSTILE_CONFIGURATION_ERROR);
      return;
    }
    if (turnstileScriptStatus !== "ready" || !window.turnstile) {
      setError(turnstileScriptStatus === "error"
        ? "Security verification could not load. Check your connection and try again."
        : "Captcha is still loading. Please try again.");
      return;
    }
    if (!turnstileToken) {
      setError("Complete security verification before logging in.");
      return;
    }
    console.info("[login] submit started");
    submittingRef.current = true;
    setError("");
    setLoading(true);
    const tokenForAttempt = turnstileToken;
    setTurnstileToken("");
    const requestController = new AbortController();
    let requestTimedOut = false;
    let loginSucceeded = false;
    const requestTimeout = window.setTimeout(() => {
      requestTimedOut = true;
      requestController.abort();
    }, 15_000);
    try {
      const form = new FormData(event.currentTarget);
      console.info("[login] request sent", { endpoint: "/api/auth/login", tokenPresent: Boolean(tokenForAttempt) });
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: requestController.signal, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe, turnstileToken: tokenForAttempt }) });
      console.info("[login] response status", { status: response.status });
      const data = await readResponse(response);
      if (!response.ok || !data.success) { setError(data.error ?? (response.status >= 500 ? "The login service is temporarily unavailable. Please try again." : "Unable to sign in.")); return; }
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const redirect = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : data.redirect ?? "/dashboard";
      loginSucceeded = true;
      console.info("[login] redirect started", { redirect });
      window.location.assign(redirect);
    } catch (cause) {
      console.error("[login] error caught", { errorType: cause instanceof Error ? cause.name : "UnknownError" });
      if (requestTimedOut || (cause instanceof DOMException && cause.name === "AbortError")) setError("Login request timed out. Please try again.");
      else if (cause instanceof Error) setError(cause.message || "A network error prevented login. Please try again.");
      else setError("A network error prevented login. Please try again.");
    } finally {
      window.clearTimeout(requestTimeout);
      if (!loginSucceeded) requestFreshTurnstileToken();
      submittingRef.current = false;
      setLoading(false);
      console.info("[login] loading reset");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {TURNSTILE_SITE_KEY ? (
        <Script
          id="cloudflare-turnstile"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setTurnstileScriptStatus("ready")}
          onError={() => {
            setTurnstileScriptStatus("error");
            setTurnstileToken("");
            setError("Security verification could not load. Check your connection and try again.");
          }}
        />
      ) : null}
      {turnstileScriptStatus === "ready" ? (
        <div ref={turnstileContainerRef} hidden aria-hidden="true" />
      ) : null}
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
      <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
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

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        size: "invisible";
        execution: "execute";
        action: string;
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": (errorCode?: string) => boolean;
        "timeout-callback": () => void;
      }) => string;
      execute: (id: string) => void;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}
