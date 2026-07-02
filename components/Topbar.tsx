"use client";

import { Bell, Moon, Plus, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopbarProps = {
  eyebrow?: string;
  title?: string;
};

export default function Topbar({
  eyebrow = "Dashboard",
  title = "Revenue Command Center",
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111f]/95 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-400">{eyebrow}</p>
          <h2 className="truncate text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:max-w-3xl xl:justify-end">
          <label className="relative min-w-0 flex-1 xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search leads, contacts, campaigns..."
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            />
          </label>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Theme placeholder">
              <Moon className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>

            <Button className="px-3 sm:px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Create</span>
            </Button>

            <Button variant="secondary" className="px-3" aria-label="User profile">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-sm leading-4 text-white">Admin</span>
                <span className="block text-xs font-normal leading-4 text-slate-400">
                  Sales Ops
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
