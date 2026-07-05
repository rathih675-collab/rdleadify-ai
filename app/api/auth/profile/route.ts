import { ApiError, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type ProfileBody = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
};

export async function PATCH(request: Request) {
  return withWorkspace(async (session) => {
    const body = await readJson<ProfileBody>(request);
    if (!body) throw new ApiError("Invalid profile payload.");

    const name = body.name?.trim();
    if (!name) throw new ApiError("Full name is required.");

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        phone: body.phone?.trim() || null,
        avatarUrl: body.avatarUrl?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        userRole: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AUTH_PROFILE_UPDATED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          timezone: body.timezone,
          language: body.language,
        },
      },
    });

    return { message: "Profile updated.", user };
  });
}
