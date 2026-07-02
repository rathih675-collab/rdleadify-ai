import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { sendVerificationOtpEmail } from "@/lib/email";
import { jsonError, readJson } from "@/lib/server/api";
import { enforceCaptcha } from "@/lib/server/captcha";
import { createOtp, hashOtp } from "@/lib/server/otp";
import { hashPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import {
  isValidEmail,
  normalizeEmail,
  slugifyWorkspaceName,
  validatePassword,
} from "@/lib/server/auth-validation";
import { addMinutes } from "@/lib/server/tokens";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  workspaceName?: string;
  captchaToken?: string;
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
};

export async function POST(request: NextRequest) {
  const body = await readJson<RegisterBody>(request);

  if (!body) return jsonError("Invalid request body.");

  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(`Too many registration attempts. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const captchaError = await enforceCaptcha(body.captchaToken, ip);
  if (captchaError) return captchaError;

  const email = normalizeEmail(body.email ?? "");
  const name = body.name?.trim() ?? "";
  const workspaceName = body.workspaceName?.trim() ?? "";
  const password = body.password ?? "";

  if (!name) return jsonError("Name is required.");
  if (!workspaceName) return jsonError("Workspace name is required.");
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");
  if (!body.acceptedTerms || !body.acceptedPrivacy) {
    return jsonError("You must accept the Terms of Service and Privacy Policy.");
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return jsonError(passwordCheck.failures.join(" "));
  }

  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);
  const otp = createOtp();
  const otpHash = hashOtp(email, otp, "email");
  const slugBase = slugifyWorkspaceName(workspaceName);
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

  const result = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug,
      },
    });

    const user = await tx.user.create({
      data: {
        workspaceId: workspace.id,
        email,
        name,
        passwordHash,
        userRole: "SUPER_ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        userRole: true,
        workspaceId: true,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        tokenHash: otpHash,
        expiresAt: addMinutes(10),
      },
    });

    return { user, workspace };
  });

  const emailResult = await sendVerificationOtpEmail({
    to: email,
    name,
    otp,
  });

  return NextResponse.json(
    {
      message: emailResult.sent
        ? "Account created. We sent a 6 digit OTP to your email."
        : "Account created, but the verification email could not be sent. Please contact support or try Resend OTP after email is configured.",
      user: result.user,
      workspace: result.workspace,
      emailSent: emailResult.sent,
      email,
    },
    { status: 201 },
  );
}
