"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  Workflow,
  Tags,
  CheckSquare,
  MessageCircle,
  Bot,
  Megaphone,
  ClipboardList,
  FileText,
  Zap,
  Phone,
  Calendar,
  Plug,
  UserCog,
  BarChart3,
  Settings,
  KeyRound,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationSections = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Leads", href: "/leads", icon: Users },
      { title: "Contacts", href: "/contacts", icon: UserRound },
      { title: "Companies", href: "/companies", icon: Building2 },
      { title: "Pipeline", href: "/pipeline", icon: Workflow },
      { title: "Tags & Labels", href: "/tags-labels", icon: Tags },
      { title: "Tasks", href: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { title: "AI Agent", href: "/ai-agent", icon: Bot },
      { title: "Campaigns", href: "/campaigns", icon: Megaphone },
      { title: "Drip Campaigns", href: "/drip-campaigns", icon: ClipboardList },
      { title: "Forms", href: "/forms", icon: FileText },
      { title: "Automation", href: "/automation", icon: Zap },
      { title: "Calling", href: "/calling", icon: Phone },
      { title: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Integrations", href: "/integrations", icon: Plug },
      { title: "Team Builder", href: "/team-builder", icon: UserCog },
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "API Keys", href: "/api-keys", icon: KeyRound },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#0b1628] lg:flex">
      <div className="border-b border-white/10 p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-2xl font-bold text-emerald-400">RDLeadify AI</h1>
          <p className="mt-1 text-sm text-slate-400">Business Operating System</p>
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
                const active = pathname === item.href;

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
            </div>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10 p-5">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-white">Enterprise Plan</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            AI-assisted CRM workspace
          </p>
        </div>
      </div>
    </aside>
  );
}
