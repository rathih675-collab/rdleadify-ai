import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  publicRoutes,
  roleAccess,
} from "@/lib/server/auth-constants";

const issuer = "rdleadify-ai";
const audience = "rdleadify-ai-app";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
  return new TextEncoder().encode(secret ?? "rdleadify-ai-local-development-secret");
}

function isPublicPath(pathname: string) {
  return (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico")
  );
}

function requiredRolesFor(pathname: string) {
  const match = Object.entries(roleAccess).find(([path]) => pathname.startsWith(path));
  return match?.[1];
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isPublicPath(pathname)) {
    if (token && ["/login", "/register"].includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer,
      audience,
    });

    const allowedRoles = requiredRolesFor(pathname);
    const role = String(payload.role ?? "");

    if (allowedRoles && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-rdleadify-user-id", String(payload.userId ?? ""));
    response.headers.set("x-rdleadify-workspace-id", String(payload.workspaceId ?? ""));
    response.headers.set("x-rdleadify-role", role);
    return response;
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
