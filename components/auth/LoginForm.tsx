"use client";

import Link from "next/link";
import Script from "next/script";
import { Loader2, LogIn } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { AuthNotice, Field, PasswordField } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/button";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const TURNSTILE_CONFIGURATION_ERROR =
  "Security verification is not configured. Please contact support.";

export default function LoginForm({ successMessage = "" }: { successMessage?: string }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileLoadFailed, setTurnstileLoadFailed] = useState(false);
  const siteKeyPresent = Boolean(TURNSTILE_SITE_KEY);
  const submittingRef = useRef(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const tokenRequestRef = useRef<{
    promise: Promise<string>;
    resolve: (token: string) => void;
    reject: (error: Error) => void;
    timeoutId: number;
  } | null>(null);

  useEffect(() => {
    console.info("[turnstile] client configuration", { siteKeyPresent });
    if (!siteKeyPresent) setError(TURNSTILE_CONFIGURATION_ERROR);
  }, [siteKeyPresent]);

  const finishTokenRequest = useCallback((token?: string, error?: Error) => {
    const pending = tokenRequestRef.current;
    if (!pending) return;
    window.clearTimeout(pending.timeoutId);
    tokenRequestRef.current = null;
    if (token) pending.resolve(token);
    else pending.reject(error ?? new Error("Security verification failed. Please try again."));
  }, []);

  useEffect(() => {
    if (!turnstileScriptLoaded) return;

    const turnstile = window.turnstile;
    const container = turnstileContainerRef.current;
    if (!turnstile || !container) {
      setTurnstileLoadFailed(true);
      setError("Security verification could not load. Please refresh and try again.");
      return;
    }

    let disposed = false;
    let widgetId: string | undefined;
    try {
      widgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        execution: "execute",
        action: "login",
        callback: token => {
          if (disposed) return;
          setTurnstileToken(token);
          console.info("[login] token received", { tokenPresent: Boolean(token) });
          finishTokenRequest(token);
        },
        "expired-callback": () => {
          setTurnstileToken("");
          finishTokenRequest(undefined, new Error("Security verification expired. Please try again."));
        },
        "error-callback": errorCode => {
          console.error("[turnstile] challenge error", { errorCode });
          setTurnstileToken("");
          setError("Security verification failed. Please try again.");
          finishTokenRequest(undefined, new Error("Security verification failed. Please try again."));
          return true;
        },
        "timeout-callback": () => {
          setTurnstileToken("");
          finishTokenRequest(undefined, new Error("Security verification timed out. Please try again."));
        },
      });
      turnstileWidgetIdRef.current = widgetId;
      setTurnstileReady(true);
      setTurnstileLoadFailed(false);
      console.info("[login] turnstile ready");
    } catch {
      setTurnstileToken("");
      setTurnstileReady(false);
      setTurnstileLoadFailed(true);
      setError("Security verification could not load. Please refresh and try again.");
    }

    return () => {
      disposed = true;
      setTurnstileReady(false);
      finishTokenRequest(undefined, new Error("Security verification was interrupted. Please try again."));
      if (widgetId) {
        try {
          turnstile.remove(widgetId);
        } catch {
          // Widget cleanup must not interrupt navigation or retries.
        }
      }
      if (turnstileWidgetIdRef.current === widgetId) turnstileWidgetIdRef.current = null;
    };
  }, [finishTokenRequest, turnstileScriptLoaded]);

  const requestFreshTurnstileToken = useCallback(() => {
    const turnstile = window.turnstile;
    const widgetId = turnstileWidgetIdRef.current;
    if (!turnstileReady || !turnstile || !widgetId) {
      return Promise.reject(new Error("Security verification could not load. Please refresh and try again."));
    }

    finishTokenRequest(undefined, new Error("Security verification was restarted. Please try again."));
    setTurnstileToken("");
    let resolveToken!: (token: string) => void;
    let rejectToken!: (error: Error) => void;
    const promise = new Promise<string>((resolve, reject) => {
      resolveToken = resolve;
      rejectToken = reject;
    });
    const timeoutId = window.setTimeout(() => {
      finishTokenRequest(undefined, new Error("Security verification timed out. Please try again."));
    }, 8_000);
    tokenRequestRef.current = { promise, resolve: resolveToken, reject: rejectToken, timeoutId };

    try {
      turnstile.reset(widgetId);
      console.info("[login] turnstile execution started");
      turnstile.execute(widgetId);
    } catch {
      finishTokenRequest(undefined, new Error("Security verification could not start. Please refresh and try again."));
    }
    return promise;
  }, [finishTokenRequest, turnstileReady]);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    const turnstile = window.turnstile;
    const widgetId = turnstileWidgetIdRef.current;
    if (!turnstile || !widgetId) return;
    try {
      turnstile.reset(widgetId);
    } catch {
      console.error("[turnstile] widget reset failed");
    }
  }, []);

  async function readResponse(response: Response) {
    const text = await response.text();
    if (!text.trim()) return { success: false, error: "The login service returned an empty response. Please try again." };
    try {
      return JSON.parse(text) as { success?: boolean; error?: string; redirect?: string };
    } catch {
      return { success: false, error: "The login service returned an invalid response. Please try again." };
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.info("[login] form submitted");
    if (submittingRef.current) return;
    if (!email.trim() || !password) return;
    if (!siteKeyPresent) {
      setError(TURNSTILE_CONFIGURATION_ERROR);
      return;
    }
    if (turnstileLoadFailed) {
      setError("Security verification could not load. Please refresh and try again.");
      return;
    }
    if (!turnstileReady || !window.turnstile) {
      setError("Captcha is still loading. Please try again.");
      return;
    }

    submittingRef.current = true;
    setError("");
    setIsSubmitting(true);
    console.info("[login] submit started");
    let requestController: AbortController | null = null;
    let requestTimeout: number | null = null;
    let requestTimedOut = false;
    try {
      const tokenForAttempt = await requestFreshTurnstileToken();
      setTurnstileToken("");
      requestController = new AbortController();
      requestTimeout = window.setTimeout(() => {
        requestTimedOut = true;
        requestController?.abort();
      }, 15_000);
      console.info("[login] request started", { endpoint: "/api/auth/login", tokenPresent: Boolean(tokenForAttempt) });
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: requestController.signal, body: JSON.stringify({ email: email.trim(), password, rememberMe, turnstileToken: tokenForAttempt }) });
      console.info("[login] response received", { status: response.status });
      const data = await readResponse(response);
      if (!response.ok || !data.success) { setError(data.error ?? (response.status >= 500 ? "The login service is temporarily unavailable. Please try again." : "Unable to sign in.")); return; }
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const redirect = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : data.redirect ?? "/dashboard";
      console.info("[login] redirect started", { redirect });
      window.location.assign(redirect);
    } catch (cause) {
      console.error("[login] error caught", { errorType: cause instanceof Error ? cause.name : "UnknownError" });
      if (requestTimedOut || (cause instanceof DOMException && cause.name === "AbortError")) setError("Login request timed out. Please try again.");
      else if (cause instanceof Error) setError(cause.message || "A network error prevented login. Please try again.");
      else setError("A network error prevented login. Please try again.");
    } finally {
      if (requestTimeout !== null) window.clearTimeout(requestTimeout);
      requestTimeout = null;
      requestController?.abort();
      requestController = null;
      finishTokenRequest(undefined, new Error("Security verification request finished."));
      resetTurnstile();
      submittingRef.current = false;
      setIsSubmitting(false);
      console.info("[login] finally executed");
    }
  }

  const loginDisabled = !email.trim() || !password || isSubmitting;

  useEffect(() => {
    console.info("[login] button disabled state", { disabled: loginDisabled });
  }, [loginDisabled]);

  return (
    <>
      {TURNSTILE_SITE_KEY ? (
        <Script
          id="cloudflare-turnstile"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setTurnstileScriptLoaded(true)}
          onError={() => {
            setTurnstileReady(false);
            setTurnstileLoadFailed(true);
            setTurnstileToken("");
            setError("Security verification could not load. Please refresh and try again.");
          }}
        />
      ) : null}
      {siteKeyPresent ? (
        <div
          ref={turnstileContainerRef}
          className="pointer-events-none fixed left-[-9999px] top-0 h-0 w-0 overflow-hidden"
          aria-hidden="true"
        />
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
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
        <Button type="submit" className="w-full" disabled={loginDisabled}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-slate-400">
          New to RDLeadify AI?{" "}
          <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
            Create account
          </Link>
        </p>
      </form>
    </>
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
