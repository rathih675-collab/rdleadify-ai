import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: string;
  workspaceId: string;
  role: string;
  email: string;
};

const issuer = "rdleadify-ai";
const audience = "rdleadify-ai-app";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or AUTH_SECRET is required in production.");
  }

  return new TextEncoder().encode(secret ?? "rdleadify-ai-local-development-secret");
}

export async function signSessionToken(payload: SessionPayload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer,
    audience,
  });

  return {
    userId: String(payload.userId),
    workspaceId: String(payload.workspaceId),
    role: String(payload.role),
    email: String(payload.email),
  } satisfies SessionPayload;
}

export function createOpaqueToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function addHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
