export const AUTH_COOKIE_NAME = "rdleadify_session";
export const REFRESH_COOKIE_NAME = "rdleadify_refresh";

export const NORMAL_SESSION_SECONDS = 60 * 60 * 24;
export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 30;

export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/privacy",
  "/terms",
  "/access-denied",
  "/workspace-disabled",
];

export const roleAccess: Record<string, string[]> = {
  "/dashboard": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/ai-agent": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/ai/prompt-engine": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/ai/playground": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/knowledge-base": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/voice-agent": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT"],
  "/calling": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/leads": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT"],
  "/contacts": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/companies": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/pipeline": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT"],
  "/automation": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/campaigns": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/drip-campaigns": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/inbox": ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT", "SUPPORT"],
  "/integrations": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/reports": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/settings": ["SUPER_ADMIN", "ADMIN"],
  "/api-keys": ["SUPER_ADMIN", "ADMIN"],
  "/team-builder": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  "/auth-settings": ["SUPER_ADMIN", "ADMIN"],
};

export const roleDisplayNames: Record<string, string> = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "WORKSPACE_ADMIN",
  MANAGER: "MANAGER",
  SALES_AGENT: "SALES_AGENT",
  SUPPORT: "SUPPORT_AGENT",
  VIEWER: "VIEWER",
};

export const enterprisePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  MANAGER: [
    "dashboard:read",
    "ai:write",
    "voice:write",
    "crm:write",
    "contacts:write",
    "leads:create",
    "leads:update",
    "automation:write",
    "campaigns:write",
    "inbox:write",
    "integrations:write",
    "knowledge:write",
    "settings:read",
    "reports:read",
  ],
  SALES_AGENT: [
    "dashboard:read",
    "ai:write",
    "voice:write",
    "crm:write",
    "contacts:read",
    "leads:create",
    "leads:update",
    "inbox:write",
    "reports:read",
  ],
  SUPPORT: ["dashboard:read", "ai:write", "crm:read", "contacts:read", "leads:update", "inbox:write"],
  VIEWER: ["dashboard:read", "crm:read", "contacts:read", "reports:read"],
};
