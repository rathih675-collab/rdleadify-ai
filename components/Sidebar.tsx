"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Inbox,
  LogOut,
  Mic2,
  MessageCircle,
  Plug,
  PhoneCall,
  Settings,
  Users,
  ChevronRight,
  BotMessageSquare,
  BrainCircuit,
  Library,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationSections = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Inbox", href: "/inbox", icon: Inbox },
    ],
  },
  {
    label: "AI Core",
    items: [
      { title: "AI Memory", href: "/ai-memory", icon: BrainCircuit },
      { title: "AI Chat Agent", href: "/ai-agent", icon: Bot },
      { title: "AI Voice Agent", href: "/voice-agent/playground", icon: Mic2 },
      { title: "Knowledge Base", href: "/knowledge-base", icon: Library },
    ],
  },
  {
    label: "Website Widget",
    items: [
      { title: "Website Widget", href: "/widget", icon: BotMessageSquare },
    ],
  },
  {
    label: "Leads",
    items: [
      { title: "Leads", href: "/leads", icon: Users },
    ],
  },
  {
    label: "Channels",
    items: [
      { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { title: "Voice", href: "/voice", icon: PhoneCall },
    ],
  },
  {
    label: "Integrations",
    items: [
      { title: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#0b1628] lg:flex">
      <div className="border-b border-white/10 p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-2xl font-bold text-emerald-400">RDLeadify AI</h1>
          <p className="mt-1 text-sm text-slate-400">AI Employee MVP</p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {navigationSections.map((section) => (
          <nav key={section.label} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {section.label}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-emerald-500 text-slate-950 font-semibold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </span>

                    {active ? <ChevronRight className="h-4 w-4 shrink-0" /> : null}
                  </Link>
                );
              })}
              {section.label === "Settings" ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className="truncate">Logout</span>
                  </span>
                </button>
              ) : null}
            </div>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10 p-5">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-white">AI Employee MVP</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            AI chat, voice, widget, inbox, leads, and integrations.
          </p>
        </div>
      </div>
    </aside>
  );
}
