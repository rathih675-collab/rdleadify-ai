import { jsonError } from "@/lib/server/api";
import { authLog } from "@/lib/server/dev-log";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

type CaptchaResult =
  | { ok: true }
  | { ok: false; error: string };

export async function verifyTurnstileToken(
  token: string | null | undefined,
  ip?: string | null,
): Promise<CaptchaResult> {
  if (process.env.NODE_ENV !== "production" && token === "dev-turnstile-bypass") {
    authLog("captcha dev bypass accepted", { ip });
    return { ok: true };
  }

  if (!token) {
    authLog("captcha validation failed", { reason: "missing_token", ip });
    return { ok: false, error: "Captcha verification is required." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    authLog("captcha validation failed", { reason: "missing_secret", ip });
    return { ok: false, error: "Captcha is not configured." };
  }

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const data = (await response.json()) as TurnstileResponse;

    if (!data.success) {
      authLog("captcha validation failed", {
        reason: "turnstile_rejected",
        errors: data["error-codes"],
        ip,
      });
      return { ok: false, error: "Captcha failed. Please try again." };
    }

    authLog("captcha validation success", { ip });
    return { ok: true };
  } catch {
    authLog("captcha validation failed", { reason: "service_unavailable", ip });
    return { ok: false, error: "Captcha verification service is unavailable." };
  }
}

export async function enforceCaptcha(
  token: string | null | undefined,
  ip?: string | null,
) {
  const captcha = await verifyTurnstileToken(token, ip);
  if (!captcha.ok) return jsonError(captcha.error, 403);
  return null;
}
