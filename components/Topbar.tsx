"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, History, LogOut, Moon, Plus, Search, Settings, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopbarProps = {
  eyebrow?: string;
  title?: string;
};

export default function Topbar({
  eyebrow = "Dashboard",
  title = "Revenue Command Center",
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name?: string | null;
    email?: string;
    avatarUrl?: string | null;
    roleLabel?: string;
    workspace?: { name?: string };
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));

    void fetch("/api/auth/session");
    const interval = window.setInterval(() => {
      void fetch("/api/auth/session");
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

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

            <div className="relative">
              <Button variant="secondary" className="px-3" aria-label="User menu" onClick={() => setMenuOpen((current) => !current)}>
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-emerald-400 text-slate-950">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4" />}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-28 truncate text-sm leading-4 text-white">{user?.name || "User"}</span>
                  <span className="block max-w-32 truncate text-xs font-normal leading-4 text-slate-400">
                    {user?.workspace?.name || "Workspace"}
                  </span>
                </span>
              </Button>
              {menuOpen ? (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-white/10 bg-[#0b1628] p-2 shadow-2xl shadow-black/30">
                  <div className="border-b border-white/10 p-3">
                    <p className="truncate text-sm font-semibold text-white">{user?.name || "Authenticated user"}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{user?.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                      {user?.roleLabel || "ROLE"}
                    </span>
                  </div>
                  <MenuLink href="/profile" icon={UserRound} label="Profile" />
                  <MenuLink href="/auth-settings" icon={Settings} label="Auth Settings" />
                  <MenuLink href="/login-history" icon={History} label="Login History" />
                  <MenuLink href="/settings" icon={ShieldCheck} label="Workspace Settings" />
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              size="icon"
              aria-label="Logout"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon: Icon, label }: { href: string; icon: typeof UserRound; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
      <Icon className="h-4 w-4 text-emerald-300" />
      {label}
    </Link>
  );
}
