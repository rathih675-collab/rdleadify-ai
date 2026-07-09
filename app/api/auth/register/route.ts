import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { sendVerificationOtpEmail, shouldExposeDevOtp } from "@/lib/email";
import { jsonError, readJson } from "@/lib/server/api";
import { authLog } from "@/lib/server/dev-log";
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
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
};

export async function POST(request: NextRequest) {
  authLog("register route hit");
  const body = await readJson<RegisterBody>(request);

  if (!body) {
    authLog("register validation failed", { reason: "invalid_body" });
    return jsonError("Invalid request body.");
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    authLog("register validation failed", { reason: "rate_limit", ip });
    return jsonError(`Too many registration attempts. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const email = normalizeEmail(body.email ?? "");
  const name = body.name?.trim() ?? "";
  const workspaceName = body.workspaceName?.trim() ?? "";
  const password = body.password ?? "";

  if (!name) {
    authLog("register validation failed", { reason: "missing_name" });
    return jsonError("Name is required.");
  }
  if (!workspaceName) {
    authLog("register validation failed", { reason: "missing_workspace" });
    return jsonError("Workspace name is required.");
  }
  if (!isValidEmail(email)) {
    authLog("register validation failed", { reason: "invalid_email" });
    return jsonError("Enter a valid email address.");
  }
  if (!body.acceptedTerms || !body.acceptedPrivacy) {
    authLog("register validation failed", { reason: "terms_privacy_missing" });
    return jsonError("You must accept the Terms of Service and Privacy Policy.");
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    authLog("register validation failed", { reason: "weak_password", failures: passwordCheck.failures });
    return jsonError(passwordCheck.failures.join(" "));
  }

  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    authLog("register validation failed", { reason: "duplicate_email", email });
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
  authLog("register database update success", { userId: result.user.id, workspaceId: result.workspace.id });

  const emailResult = await sendVerificationOtpEmail({
    to: email,
    name,
    otp,
  });
  authLog(emailResult.sent ? "register email send success" : "register email send fail", {
    email,
    reason: emailResult.sent ? undefined : emailResult.reason,
    devOtp: shouldExposeDevOtp(emailResult) ? otp : undefined,
  });
  const exposeDevOtp = shouldExposeDevOtp(emailResult);

  return NextResponse.json(
    {
      message: emailResult.sent
        ? "OTP sent to your email. Please check your inbox."
        : exposeDevOtp
          ? "Account created. Email is not configured, so use the development OTP below."
          : "Email delivery failed. Please try again.",
      user: result.user,
      workspace: result.workspace,
      emailSent: emailResult.sent,
      email,
      devOtp: exposeDevOtp ? otp : undefined,
    },
    { status: 201 },
  );
}
