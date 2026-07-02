import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent") ?? "unknown";
}

export function getDeviceLabel(userAgent: string) {
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile browser";
  if (/ipad|tablet/i.test(userAgent)) return "Tablet browser";
  if (/windows/i.test(userAgent)) return "Windows browser";
  if (/mac os/i.test(userAgent)) return "Mac browser";
  return "Browser session";
}
