"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/Sidebar";

export default function MvpShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-slate-100">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="border-b border-white/10 bg-[#07111f]/95 px-4 py-5 md:px-8">
          <p className="text-sm font-medium text-emerald-400">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{title}</h1>
        </header>
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
