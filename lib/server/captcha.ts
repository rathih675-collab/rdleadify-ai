import { jsonError } from "@/lib/server/api";

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
  if (!token) {
    return { ok: false, error: "Captcha verification is required." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
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
      return { ok: false, error: "Captcha failed. Please try again." };
    }

    return { ok: true };
  } catch {
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
