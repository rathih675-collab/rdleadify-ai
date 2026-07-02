const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim().toLowerCase());
}

export function validatePassword(password: string) {
  const failures: string[] = [];

  if (password.length < 10) failures.push("Use at least 10 characters.");
  if (!/[A-Z]/.test(password)) failures.push("Add one uppercase letter.");
  if (!/[a-z]/.test(password)) failures.push("Add one lowercase letter.");
  if (!/[0-9]/.test(password)) failures.push("Add one number.");
  if (!/[^A-Za-z0-9]/.test(password)) failures.push("Add one special character.");

  return {
    valid: failures.length === 0,
    failures,
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function slugifyWorkspaceName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return base || "workspace";
}
