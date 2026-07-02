export const AUTH_COOKIE_NAME = "rdleadify_session";

export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export const roleAccess: Record<string, string[]> = {
  "/api-keys": ["SUPER_ADMIN", "ADMIN"],
  "/settings": ["SUPER_ADMIN", "ADMIN"],
  "/team-builder": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/integrations": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/reports": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
};
