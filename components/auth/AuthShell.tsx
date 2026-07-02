import Link from "next/link";
import { Bot, MessageCircle, Mic2, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const highlights = [
  { label: "AI CRM", icon: Bot },
  { label: "WhatsApp Automation", icon: MessageCircle },
  { label: "AI Voice Agent", icon: Mic2 },
  { label: "Workflow Builder", icon: Workflow },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b16] text-white">
      <div className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-white/[0.025] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950 shadow-lg shadow-emerald-500/20">
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

          <div className="relative z-10 grid gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-12 left-10 h-px w-64 bg-gradient-to-r from-emerald-400/70 to-transparent" />
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-2xl font-bold text-emerald-400">
                RDLeadify AI
              </Link>
              <p className="mt-1 text-sm text-slate-400">Business Operating System</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                Secure RDLeadify access
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
