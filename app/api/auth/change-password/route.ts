import { ApiError, readJson, withWorkspace } from "@/lib/server/api";
import { validatePassword } from "@/lib/server/auth-validation";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function PATCH(request: Request) {
  return withWorkspace(async (session) => {
    const body = await readJson<ChangePasswordBody>(request);
    if (!body?.currentPassword || !body.newPassword) {
      throw new ApiError("Current password and new password are required.");
    }

    const passwordCheck = validatePassword(body.newPassword);
    if (!passwordCheck.valid) {
      throw new ApiError(passwordCheck.failures.join(" "));
    }

    const user = await prisma.user.findFirst({
      where: { id: session.userId, workspaceId: session.workspaceId },
      select: { id: true, passwordHash: true },
    });

    if (!user) throw new ApiError("User not found.", 404);
    if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
      throw new ApiError("Current password is incorrect.", 401);
    }
    if (await verifyPassword(body.newPassword, user.passwordHash)) {
      throw new ApiError("New password must be different from your current password.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(body.newPassword) },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, workspaceId: session.workspaceId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.authSession.updateMany({
        where: { userId: user.id, workspaceId: session.workspaceId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.activityLog.create({
        data: {
          workspaceId: session.workspaceId,
          userId: user.id,
          action: "AUTH_PASSWORD_CHANGED",
          entityType: "User",
          entityId: user.id,
          metadata: { passwordHistoryPolicy: "current-password-not-reused" },
        },
      }),
    ]);

    return { message: "Password changed. Please sign in again." };
  });
}
