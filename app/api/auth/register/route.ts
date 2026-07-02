import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { jsonError, readJson } from "@/lib/server/api";
import { hashPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import {
  isValidEmail,
  normalizeEmail,
  slugifyWorkspaceName,
  validatePassword,
} from "@/lib/server/auth-validation";
import { addHours, createOpaqueToken, hashOpaqueToken } from "@/lib/server/tokens";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  workspaceName?: string;
};

export async function POST(request: Request) {
  const body = await readJson<RegisterBody>(request);

  if (!body) return jsonError("Invalid request body.");

  const email = normalizeEmail(body.email ?? "");
  const name = body.name?.trim() ?? "";
  const workspaceName = body.workspaceName?.trim() ?? "";
  const password = body.password ?? "";

  if (!name) return jsonError("Name is required.");
  if (!workspaceName) return jsonError("Workspace name is required.");
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");

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
  const verificationToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(verificationToken);
  const slugBase = slugifyWorkspaceName(workspaceName);
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

  const result = await prisma.$transaction(async (tx) => {
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
        tokenHash,
        expiresAt: addHours(24),
      },
    });

    return { user, workspace };
  });

  return NextResponse.json(
    {
      message: "Account created. Verify your email before signing in.",
      user: result.user,
      workspace: result.workspace,
      verificationToken:
        process.env.NODE_ENV === "production" ? undefined : verificationToken,
    },
    { status: 201 },
  );
}
