"use client";

const checks = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Lowercase", test: (value: string) => /[a-z]/.test(value) },
  { label: "Number", test: (value: string) => /\d/.test(value) },
  { label: "Special", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function passwordScore(password: string) {
  return checks.filter((check) => check.test(password)).length;
}

export default function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const width = `${(score / checks.length) * 100}%`;
  const color = score >= 5 ? "bg-emerald-400" : score >= 3 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {checks.map((check) => {
          const passed = check.test(password);
          return (
            <span key={check.label} className={passed ? "text-emerald-300" : "text-slate-500"}>
              {passed ? "✓" : "○"} {check.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
