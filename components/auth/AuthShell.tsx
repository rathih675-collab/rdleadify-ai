import Link from "next/link";
import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const highlights = [
  { label: "Secure sessions", icon: ShieldCheck },
  { label: "AI-ready workspace", icon: Sparkles },
  { label: "Role workflows", icon: Workflow },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#0b1628] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400 text-lg font-black text-slate-950">
                RD
              </span>
              <span>
                <span className="block text-xl font-bold text-white">RDLeadify AI</span>
                <span className="block text-sm text-slate-400">Business Operating System</span>
              </span>
            </Link>

            <div className="mt-20 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">
                {title}
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">{description}</p>
            </div>
          </div>

          <div className="grid gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-2xl font-bold text-emerald-400">
                RDLeadify AI
              </Link>
              <p className="mt-1 text-sm text-slate-400">Business Operating System</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 sm:p-7">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
