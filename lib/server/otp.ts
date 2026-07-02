import { randomInt } from "node:crypto";

import { hashOpaqueToken } from "@/lib/server/tokens";

export function createOtp() {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(email: string, otp: string, purpose: "email" | "password") {
  return hashOpaqueToken(`${purpose}:${email}:${otp}`);
}

export function validateOtpShape(otp: string) {
  return /^\d{6}$/.test(otp);
}
