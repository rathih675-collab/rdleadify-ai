import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type AppointmentBody = {
  title?: string;
  description?: string;
  startsAt?: string;
  leadId?: string;
};

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "leads:update");

    const body = await readJson<AppointmentBody>(request);
    if (!body) throw new ApiError("Invalid request body.");

    const startsAt = body.startsAt ? new Date(body.startsAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (Number.isNaN(startsAt.getTime())) throw new ApiError("Invalid appointment date.");

    if (body.leadId) {
      const leadExists = await prisma.lead.count({
        where: {
          id: body.leadId,
          workspaceId: session.workspaceId,
        },
      });

      if (!leadExists) throw new ApiError("Lead not found in this workspace.", 404);
    }

    const appointment = await prisma.appointment.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        leadId: body.leadId,
        title: body.title?.slice(0, 180) || "AI Agent Demo Appointment",
        description: body.description?.slice(0, 2000),
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60 * 1000),
      },
      select: {
        id: true,
        title: true,
        startsAt: true,
        status: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        leadId: body.leadId,
        action: "AI_APPOINTMENT_CREATED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          source: "AI Agent",
          startsAt: appointment.startsAt.toISOString(),
        },
      },
    });

    return { appointment };
  });
}
