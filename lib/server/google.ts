import crypto from "node:crypto";

import { IntegrationStatus, Prisma } from "@prisma/client";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";

export const googleScopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
];

const integrationProvider = "google";
const integrationName = "Google Workspace";
export const googleSheetLeadHeaders = [
  "Name",
  "Phone",
  "Email",
  "Company",
  "Requirement",
  "Budget",
  "Source",
  "Lead Score",
  "Summary",
  "Created At",
];

type GoogleTokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
};

export type StoredGoogleCredentials = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  connected_email?: string;
  scopes: string[];
  provider: "google";
  status: "connected";
  encrypted: boolean;
};

type GoogleCredentialRecord = {
  provider: "google";
  status: "connected";
  connected_email?: string;
  scopes: string[];
  expiry_date?: number;
  access_token?: string;
  refresh_token?: string;
  encrypted?: {
    scheme: "aes-256-gcm";
    access_token: string;
    refresh_token?: string;
  };
};

type GoogleAccessContext = {
  accessToken: string;
  authenticatedEmail?: string;
  scopes: string[];
  accessTokenStatus: "present" | "missing" | "expired" | "refreshed";
  refreshTokenStatus: "present" | "missing" | "used" | "not_used";
};

type GoogleApiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: unknown;
  };
  error_description?: string;
  [key: string]: unknown;
};

type SheetMetadata = {
  spreadsheetId?: string;
  properties?: {
    title?: string;
  };
  sheets?: Array<{
    properties?: {
      title?: string;
      sheetId?: number;
      index?: number;
    };
  }>;
};

export class GoogleApiError extends Error {
  status: number;
  code?: number;
  responseBody?: GoogleApiErrorBody | string | null;
  diagnostics: Record<string, unknown>;

  constructor(message: string, status: number, diagnostics: Record<string, unknown>, responseBody?: GoogleApiErrorBody | string | null) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
    this.code = typeof diagnostics.googleApiErrorCode === "number" ? diagnostics.googleApiErrorCode : undefined;
    this.diagnostics = diagnostics;
    this.responseBody = responseBody;
  }
}

export function missingGoogleOAuthEnv() {
  return [
    ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
    ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET],
    ["GOOGLE_REDIRECT_URI", process.env.GOOGLE_REDIRECT_URI],
    ["APP_URL", process.env.APP_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => String(key));
}

export function missingSheetsEnv() {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? [] : ["GOOGLE_SHEETS_SPREADSHEET_ID"];
}

export function missingCalendarEnv() {
  return process.env.GOOGLE_CALENDAR_ID ? [] : ["GOOGLE_CALENDAR_ID"];
}

export function buildGoogleAuthUrl(state: string) {
  const missing = missingGoogleOAuthEnv();
  if (missing.length) throw new Error(`Missing Google OAuth configuration: ${missing.join(", ")}`);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI ?? "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", googleScopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) throw new Error("Google OAuth token exchange failed.");
  return normalizeTokenSet((await response.json()) as GoogleTokenSet);
}

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Google profile request failed.");
  return (await response.json()) as { email?: string; name?: string; picture?: string };
}

export async function upsertGoogleIntegration(input: {
  workspaceId: string;
  tokens: GoogleTokenSet;
  connectedEmail?: string;
}) {
  const current = await prisma.integration.findUnique({
    where: {
      workspaceId_provider_name: {
        workspaceId: input.workspaceId,
        provider: integrationProvider,
        name: integrationName,
      },
    },
    select: { credentials: true },
  });
  const currentCredentials = current?.credentials ? unwrapCredentials(current.credentials) : null;
  const refreshToken = input.tokens.refresh_token ?? currentCredentials?.refresh_token;
  const scopes = Array.from(new Set((input.tokens.scope?.split(/\s+/).filter(Boolean) ?? googleScopes)));

  return prisma.integration.upsert({
    where: {
      workspaceId_provider_name: {
        workspaceId: input.workspaceId,
        provider: integrationProvider,
        name: integrationName,
      },
    },
    update: {
      status: IntegrationStatus.CONNECTED,
      credentials: toJsonValue(
        wrapCredentials({
          access_token: input.tokens.access_token,
          refresh_token: refreshToken,
          expiry_date: input.tokens.expiry_date,
          connected_email: input.connectedEmail,
          scopes,
          provider: "google",
          status: "connected",
          encrypted: Boolean(getEncryptionKey()),
        }),
      ),
      settings: toJsonValue({
        sheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? null,
        calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
      }),
      lastSyncedAt: new Date(),
    },
    create: {
      workspaceId: input.workspaceId,
      provider: integrationProvider,
      name: integrationName,
      status: IntegrationStatus.CONNECTED,
      credentials: toJsonValue(
        wrapCredentials({
          access_token: input.tokens.access_token,
          refresh_token: refreshToken,
          expiry_date: input.tokens.expiry_date,
          connected_email: input.connectedEmail,
          scopes,
          provider: "google",
          status: "connected",
          encrypted: Boolean(getEncryptionKey()),
        }),
      ),
      settings: toJsonValue({
        sheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? null,
        calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
      }),
      lastSyncedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      lastSyncedAt: true,
      credentials: true,
      settings: true,
    },
  });
}

export async function getGoogleIntegration(workspaceId: string) {
  const integration = await prisma.integration.findUnique({
    where: {
      workspaceId_provider_name: {
        workspaceId,
        provider: integrationProvider,
        name: integrationName,
      },
    },
    select: {
      id: true,
      status: true,
      credentials: true,
      settings: true,
      lastSyncedAt: true,
      updatedAt: true,
    },
  });

  if (!integration || integration.status !== IntegrationStatus.CONNECTED || !integration.credentials) return null;
  return {
    ...integration,
    credentials: unwrapCredentials(integration.credentials),
  };
}

export async function getGoogleAccessToken(workspaceId: string) {
  const context = await getGoogleAccessContext(workspaceId);
  return context.accessToken;
}

export async function getGoogleAccessContext(workspaceId: string): Promise<GoogleAccessContext> {
  const integration = await getGoogleIntegration(workspaceId);
  if (!integration) throw new Error("Google not connected.");

  const credentials = integration.credentials;
  const hasRefreshToken = Boolean(credentials.refresh_token);
  const baseContext = {
    authenticatedEmail: credentials.connected_email,
    scopes: credentials.scopes ?? [],
    refreshTokenStatus: hasRefreshToken ? "present" as const : "missing" as const,
  };

  if (!credentials.access_token) {
    return {
      ...baseContext,
      accessToken: "",
      accessTokenStatus: "missing",
    };
  }

  if (credentials.expiry_date && credentials.expiry_date <= Date.now() + 60_000) {
    if (!credentials.refresh_token) throw new Error("Token expired. Reconnect Google to continue.");
    const refreshed = await refreshGoogleAccessToken(credentials.refresh_token);
    const profileEmail = credentials.connected_email;
    await upsertGoogleIntegration({
      workspaceId,
      tokens: {
        ...refreshed,
        refresh_token: credentials.refresh_token,
      },
      connectedEmail: profileEmail,
    });
    return {
      accessToken: refreshed.access_token,
      authenticatedEmail: profileEmail,
      scopes: credentials.scopes ?? [],
      accessTokenStatus: "refreshed",
      refreshTokenStatus: "used",
    };
  }

  return {
    ...baseContext,
    accessToken: credentials.access_token,
    accessTokenStatus: "present",
  };
}

async function forceRefreshGoogleAccessContext(workspaceId: string): Promise<GoogleAccessContext> {
  const integration = await getGoogleIntegration(workspaceId);
  if (!integration) throw new Error("Google not connected.");
  const credentials = integration.credentials;
  if (!credentials.refresh_token) throw new Error("Refresh token missing. Reconnect Google to continue.");

  const refreshed = await refreshGoogleAccessToken(credentials.refresh_token);
  await upsertGoogleIntegration({
    workspaceId,
    tokens: {
      ...refreshed,
      refresh_token: credentials.refresh_token,
    },
    connectedEmail: credentials.connected_email,
  });

  return {
    accessToken: refreshed.access_token,
    authenticatedEmail: credentials.connected_email,
    scopes: credentials.scopes ?? [],
    accessTokenStatus: "refreshed",
    refreshTokenStatus: "used",
  };
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) throw new Error("Token expired. Reconnect Google to continue.");
  return normalizeTokenSet((await response.json()) as GoogleTokenSet);
}

export async function disconnectGoogleIntegration(workspaceId: string) {
  const integration = await getGoogleIntegration(workspaceId);
  const refreshToken = integration?.credentials.refresh_token;
  const accessToken = integration?.credentials.access_token;
  const token = refreshToken ?? accessToken;

  if (token) {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    }).catch(() => null);
  }

  return prisma.integration.upsert({
    where: {
      workspaceId_provider_name: {
        workspaceId,
        provider: integrationProvider,
        name: integrationName,
      },
    },
    update: {
      status: IntegrationStatus.DISCONNECTED,
      credentials: Prisma.DbNull,
      lastSyncedAt: new Date(),
    },
    create: {
      workspaceId,
      provider: integrationProvider,
      name: integrationName,
      status: IntegrationStatus.DISCONNECTED,
      credentials: Prisma.DbNull,
    },
  });
}

export async function appendLeadToGoogleSheet(workspaceId: string, row: string[]) {
  const missing = missingSheetsEnv();
  if (missing.length) throw new Error("Missing spreadsheet ID.");

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
  const preferredWorksheet = process.env.GOOGLE_SHEETS_WORKSHEET_NAME || "Sheet1";
  let accessContext = await getGoogleAccessContext(workspaceId);
  const hasSheetsScope = accessContext.scopes.includes("https://www.googleapis.com/auth/spreadsheets");
  if (accessContext.scopes.length > 0 && !hasSheetsScope) {
    throw new GoogleApiError("Google OAuth connection is missing the Google Sheets scope. Reconnect Google with Sheets access.", 403, {
      spreadsheetId,
      worksheetName: preferredWorksheet,
      authenticatedEmail: accessContext.authenticatedEmail,
      accessTokenStatus: accessContext.accessTokenStatus,
      refreshTokenStatus: accessContext.refreshTokenStatus,
      scopes: accessContext.scopes,
      hasSheetsScope,
      googleApiErrorCode: 403,
      googleApiErrorMessage: "Google OAuth connection is missing the Google Sheets scope. Reconnect Google with Sheets access.",
      googleApiResponseBody: null,
    });
  }

  if (!accessContext.accessToken) {
    throw new GoogleApiError("Google access token is missing.", 401, {
      spreadsheetId,
      worksheetName: preferredWorksheet,
      authenticatedEmail: accessContext.authenticatedEmail,
      accessTokenStatus: accessContext.accessTokenStatus,
      refreshTokenStatus: accessContext.refreshTokenStatus,
      scopes: accessContext.scopes,
      hasSheetsScope,
      googleApiErrorCode: 401,
      googleApiErrorMessage: "Google access token is missing.",
      googleApiResponseBody: null,
    });
  }

  const runAppend = async (context: GoogleAccessContext) => {
    const metadata = await fetchSpreadsheetMetadata(spreadsheetId, context);
    const worksheetName = resolveWorksheetName(metadata, preferredWorksheet);
    await ensureGoogleSheetHeaders(spreadsheetId, worksheetName, context);
    const range = `${escapeSheetName(worksheetName)}!A:J`;
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row.map(toPlainSheetCell)] }),
      },
    );

    if (!response.ok) {
      await throwGoogleSheetsError(response, {
        spreadsheetId,
        worksheetName,
        authenticatedEmail: context.authenticatedEmail,
        accessTokenStatus: context.accessTokenStatus,
        refreshTokenStatus: context.refreshTokenStatus,
        scopes: context.scopes,
        hasSheetsScope,
      });
    }

    const body = (await response.json()) as Record<string, unknown>;
    const diagnostics = {
      spreadsheetId,
      worksheetName,
      authenticatedEmail: context.authenticatedEmail,
      accessTokenStatus: context.accessTokenStatus,
      refreshTokenStatus: context.refreshTokenStatus,
      scopes: context.scopes,
      hasSheetsScope,
      spreadsheetTitle: metadata.properties?.title,
      availableWorksheets: listWorksheetNames(metadata),
    };

    backendLog("google-sheets", "append succeeded", diagnostics);

    return {
      ...body,
      diagnostics,
    };
  };

  try {
    return await runAppend(accessContext);
  } catch (error) {
    if (error instanceof GoogleApiError && (error.status === 401 || error.status === 403) && error.responseBody) {
      accessContext = await forceRefreshGoogleAccessContext(workspaceId);
      backendLog("google-sheets", "retrying append after token refresh", {
        spreadsheetId,
        authenticatedEmail: accessContext.authenticatedEmail,
        accessTokenStatus: accessContext.accessTokenStatus,
        refreshTokenStatus: accessContext.refreshTokenStatus,
      });
      return runAppend(accessContext);
    }

    throw error;
  }
}

async function ensureGoogleSheetHeaders(spreadsheetId: string, worksheetName: string, context: GoogleAccessContext) {
  const headerRange = `${escapeSheetName(worksheetName)}!A1:J1`;
  const getResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(headerRange)}?majorDimension=ROWS`,
    {
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
      },
    },
  );

  if (!getResponse.ok) {
    await throwGoogleSheetsError(getResponse, {
      spreadsheetId,
      worksheetName,
      authenticatedEmail: context.authenticatedEmail,
      accessTokenStatus: context.accessTokenStatus,
      refreshTokenStatus: context.refreshTokenStatus,
      scopes: context.scopes,
      hasSheetsScope: context.scopes.includes("https://www.googleapis.com/auth/spreadsheets"),
      operation: "values.get.headers",
    });
  }

  const headerData = (await getResponse.json()) as { values?: string[][] };
  const firstRow = headerData.values?.[0] ?? [];
  const rowIsEmpty = firstRow.length === 0 || firstRow.every((cell) => !String(cell ?? "").trim());
  if (!rowIsEmpty) return;

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [googleSheetLeadHeaders] }),
    },
  );

  if (!updateResponse.ok) {
    await throwGoogleSheetsError(updateResponse, {
      spreadsheetId,
      worksheetName,
      authenticatedEmail: context.authenticatedEmail,
      accessTokenStatus: context.accessTokenStatus,
      refreshTokenStatus: context.refreshTokenStatus,
      scopes: context.scopes,
      hasSheetsScope: context.scopes.includes("https://www.googleapis.com/auth/spreadsheets"),
      operation: "values.update.headers",
    });
  }

  backendLog("google-sheets", "headers added", {
    spreadsheetId,
    worksheetName,
    headers: googleSheetLeadHeaders,
  });
}

function toPlainSheetCell(value: unknown) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();
}

async function fetchSpreadsheetMetadata(spreadsheetId: string, context: GoogleAccessContext): Promise<SheetMetadata> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties(title,sheetId,index)`,
    {
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    await throwGoogleSheetsError(response, {
      spreadsheetId,
      worksheetName: process.env.GOOGLE_SHEETS_WORKSHEET_NAME || "Sheet1",
      authenticatedEmail: context.authenticatedEmail,
      accessTokenStatus: context.accessTokenStatus,
      refreshTokenStatus: context.refreshTokenStatus,
      scopes: context.scopes,
      hasSheetsScope: context.scopes.includes("https://www.googleapis.com/auth/spreadsheets"),
      operation: "spreadsheets.get",
    });
  }

  const metadata = (await response.json()) as SheetMetadata;
  const worksheets = listWorksheetNames(metadata);

  if (!metadata.spreadsheetId || worksheets.length === 0) {
    throw new GoogleApiError("Spreadsheet exists but no worksheets were returned by Google Sheets.", 404, {
      spreadsheetId,
      worksheetName: process.env.GOOGLE_SHEETS_WORKSHEET_NAME || "Sheet1",
      authenticatedEmail: context.authenticatedEmail,
      accessTokenStatus: context.accessTokenStatus,
      refreshTokenStatus: context.refreshTokenStatus,
      scopes: context.scopes,
      hasSheetsScope: context.scopes.includes("https://www.googleapis.com/auth/spreadsheets"),
      googleApiErrorCode: 404,
      googleApiErrorMessage: "Spreadsheet exists but no worksheets were returned by Google Sheets.",
      googleApiResponseBody: metadata,
      operation: "spreadsheets.get",
    }, metadata);
  }

  backendLog("google-sheets", "spreadsheet verified", {
    spreadsheetId,
    spreadsheetTitle: metadata.properties?.title,
    availableWorksheets: worksheets,
    authenticatedEmail: context.authenticatedEmail,
    accessTokenStatus: context.accessTokenStatus,
    refreshTokenStatus: context.refreshTokenStatus,
    hasSheetsScope: context.scopes.includes("https://www.googleapis.com/auth/spreadsheets"),
  });

  return metadata;
}

function listWorksheetNames(metadata: SheetMetadata) {
  return metadata.sheets?.map((sheet) => sheet.properties?.title).filter((title): title is string => Boolean(title)) ?? [];
}

function resolveWorksheetName(metadata: SheetMetadata, preferredWorksheet: string) {
  const worksheets = listWorksheetNames(metadata);
  const exact = worksheets.find((name) => name === preferredWorksheet);
  if (exact) return exact;

  const caseInsensitive = worksheets.find((name) => name.toLowerCase() === preferredWorksheet.toLowerCase());
  if (caseInsensitive) return caseInsensitive;

  const firstWorksheet = worksheets[0];
  if (!firstWorksheet) {
    throw new GoogleApiError("No worksheet is available in the spreadsheet.", 404, {
      spreadsheetId: metadata.spreadsheetId,
      worksheetName: preferredWorksheet,
      availableWorksheets: worksheets,
      googleApiErrorCode: 404,
      googleApiErrorMessage: "No worksheet is available in the spreadsheet.",
      googleApiResponseBody: metadata,
    }, metadata);
  }

  backendLog("google-sheets", "preferred worksheet missing, using first worksheet", {
    preferredWorksheet,
    worksheetName: firstWorksheet,
    availableWorksheets: worksheets,
  });

  return firstWorksheet;
}

function escapeSheetName(name: string) {
  return `'${name.replaceAll("'", "''")}'`;
}

async function throwGoogleSheetsError(response: Response, diagnostics: Record<string, unknown>): Promise<never> {
  const responseBody = await readGoogleErrorBody(response);
  const googleError = typeof responseBody === "object" && responseBody
    ? (responseBody as GoogleApiErrorBody).error
    : undefined;
  const googleApiErrorCode = googleError?.code ?? response.status;
  const googleErrorDescription =
    typeof responseBody === "object" && responseBody ? (responseBody as GoogleApiErrorBody).error_description : undefined;
  const googleApiErrorMessage =
    (googleError?.message ?? googleErrorDescription ?? response.statusText) || "Google Sheets request failed.";
  const fullDiagnostics = {
    ...diagnostics,
    googleApiErrorCode,
    googleApiErrorMessage,
    googleApiResponseBody: responseBody,
  };

  backendLog("google-sheets", "Google Sheets API error", fullDiagnostics);

  throw new GoogleApiError(googleApiErrorMessage, response.status, fullDiagnostics, responseBody);
}

export async function createGoogleCalendarEvent(workspaceId: string, event: Record<string, unknown>) {
  const missing = missingCalendarEnv();
  if (missing.length) throw new Error("Missing calendar ID.");

  const accessToken = await getGoogleAccessToken(workspaceId);
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    },
  );

  if (!response.ok) {
    const error = await readGoogleError(response);
    throw new Error(error || "Google Calendar booking failed.");
  }

  return (await response.json()) as Record<string, unknown>;
}

export function maskedGoogleStatus(workspaceId: string) {
  return getGoogleIntegration(workspaceId).then((integration) => {
    const credentials = integration?.credentials;
    return {
      connected: Boolean(credentials),
      provider: "google",
      status: credentials ? "connected" : "disconnected",
      connectedEmail: credentials?.connected_email ?? null,
      lastSync: integration?.lastSyncedAt?.toISOString() ?? null,
      scopes: credentials?.scopes ?? [],
      maskedCredentials: credentials
        ? {
            accessToken: maskToken(credentials.access_token),
            refreshToken: credentials.refresh_token ? maskToken(credentials.refresh_token) : null,
            expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
            encrypted: credentials.encrypted,
          }
        : null,
      demoMode: !credentials,
      missingOAuthEnv: missingGoogleOAuthEnv(),
      missingSheetsEnv: missingSheetsEnv(),
      missingCalendarEnv: missingCalendarEnv(),
    };
  });
}

function normalizeTokenSet(tokens: GoogleTokenSet): GoogleTokenSet {
  return {
    ...tokens,
    expiry_date: tokens.expiry_date ?? (tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined),
  };
}

function getEncryptionKey() {
  const raw = process.env.GOOGLE_CREDENTIAL_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? process.env.JWT_SECRET;
  if (!raw) return null;
  if (/^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  try {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length === 32) return decoded;
  } catch {
  }
  return crypto.createHash("sha256").update(raw).digest();
}

function encryptSecret(value?: string) {
  if (!value) return undefined;
  const key = getEncryptionKey();
  if (!key) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptSecret(value?: string) {
  if (!value) return undefined;
  const key = getEncryptionKey();
  if (!key || !value.includes(".")) return value;
  const [iv, tag, encrypted] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function wrapCredentials(credentials: StoredGoogleCredentials): GoogleCredentialRecord {
  const accessToken = encryptSecret(credentials.access_token);
  const refreshToken = encryptSecret(credentials.refresh_token);
  const encrypted = getEncryptionKey();

  if (encrypted) {
    return {
      provider: "google",
      status: "connected",
      connected_email: credentials.connected_email,
      scopes: credentials.scopes,
      expiry_date: credentials.expiry_date,
      encrypted: {
        scheme: "aes-256-gcm",
        access_token: accessToken ?? "",
        refresh_token: refreshToken,
      },
    };
  }

  return {
    provider: "google",
    status: "connected",
    connected_email: credentials.connected_email,
    scopes: credentials.scopes,
    expiry_date: credentials.expiry_date,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

function unwrapCredentials(value: Prisma.JsonValue): StoredGoogleCredentials {
  const record = value as GoogleCredentialRecord;
  const encrypted = record.encrypted;
  return {
    access_token: decryptSecret(encrypted?.access_token ?? record.access_token) ?? "",
    refresh_token: decryptSecret(encrypted?.refresh_token ?? record.refresh_token),
    expiry_date: record.expiry_date,
    connected_email: record.connected_email,
    scopes: record.scopes ?? [],
    provider: "google",
    status: "connected",
    encrypted: Boolean(encrypted),
  };
}

function maskToken(token: string) {
  if (!token) return "";
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function readGoogleError(response: Response) {
  const data = await readGoogleErrorBody(response);
  if (typeof data === "string") return data;
  return data?.error?.message ?? data?.error_description ?? null;
}

async function readGoogleErrorBody(response: Response): Promise<GoogleApiErrorBody | string | null> {
  try {
    return (await response.json()) as GoogleApiErrorBody;
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}
