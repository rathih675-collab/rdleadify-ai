export function authLog(message: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] ${message}`, metadata ?? "");
  }
}

export function backendLog(scope: string, message: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[${scope}] ${message}`, metadata ?? "");
  }
}
