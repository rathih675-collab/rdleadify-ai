import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { enterprisePermissions } from "@/lib/server/auth-constants";
import { prisma } from "@/lib/server/prisma";
import { type SessionPayload, verifySessionToken } from "@/lib/server/tokens";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(details === undefined ? {} : { details }),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    {
      ...init,
      headers: {
        "Cache-Control": "no-store",
        ...init?.headers,
      },
    },
  );
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export type WorkspaceSession = SessionPayload & {
  permissions: string[];
};

type RouteHandler<T> = (session: WorkspaceSession) => Promise<T>;

const defaultRolePermissions = enterprisePermissions;

export async function requireWorkspaceSession(): Promise<WorkspaceSession> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError("Not authenticated.", 401);
  }

  let session: SessionPayload;
  try {
    session = await verifySessionToken(token);
  } catch {
    throw new ApiError("Not authenticated.", 401);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      workspaceId: session.workspaceId,
      isActive: true,
    },
    select: {
      userRole: true,
      emailVerifiedAt: true,
      workspace: {
        select: {
          id: true,
        },
      },
      role: {
        select: {
          permissions: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError("Session user is inactive or no longer belongs to this workspace.", 401);
  }

  if (!user.emailVerifiedAt) {
    throw new ApiError("Please verify your email before continuing.", 403);
  }

  return {
    ...session,
    role: user.userRole,
    permissions: [
      ...(defaultRolePermissions[user.userRole] ?? []),
      ...(user.role?.permissions.map((permission) => permission.key) ?? []),
    ],
  };
}

export function assertPermission(session: WorkspaceSession, permission: string) {
  if (session.permissions.includes("*")) return;
  if (session.permissions.includes(permission)) return;

  throw new ApiError("You do not have permission to perform this action.", 403);
}

export function paginationFromUrl(request: Request, defaults = { take: 50, max: 100 }) {
  const url = new URL(request.url);
  const take = Math.min(defaults.max, Math.max(1, Number(url.searchParams.get("take") ?? defaults.take)));
  const cursor = url.searchParams.get("cursor") ?? undefined;

  return { take, cursor };
}

export async function withWorkspace<T>(handler: RouteHandler<T>) {
  try {
    const session = await requireWorkspaceSession();
    return jsonOk(await handler(session));
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status, error.details);
    }

    console.error("[api] unhandled route error", error);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}

export function toJsonValue<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}
