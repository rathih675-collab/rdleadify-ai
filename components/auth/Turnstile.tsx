"use client";

import Script from "next/script";
import { useEffect, useId } from "react";

type TurnstileProps = {
  onVerify: (token: string) => void;
};

declare global {
  interface Window {
    [key: `rdleadifyTurnstile${string}`]: (token: string) => void;
  }
}

export default function Turnstile({ onVerify }: TurnstileProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const callbackName = `rdleadifyTurnstile${id}` as const;
  const configured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  useEffect(() => {
    window[callbackName] = onVerify;
    return () => {
      delete window[callbackName];
    };
  }, [callbackName, onVerify]);

  if (!configured) {
    return (
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
        Captcha site key is missing. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/30 p-2">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback={callbackName}
        data-theme="dark"
      />
    </div>
  );
}
