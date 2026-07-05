import { headers } from "next/headers";
import { MonitorSmartphone, ShieldCheck } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/server/prisma";

function parseBrowser(userAgent?: string | null) {
  const value = userAgent || "";
  if (/edg/i.test(value)) return "Edge";
  if (/chrome/i.test(value)) return "Chrome";
  if (/safari/i.test(value)) return "Safari";
  if (/firefox/i.test(value)) return "Firefox";
  return "Browser";
}

function parseOs(userAgent?: string | null) {
  const value = userAgent || "";
  if (/windows/i.test(value)) return "Windows";
  if (/mac os/i.test(value)) return "macOS";
  if (/android/i.test(value)) return "Android";
  if (/iphone|ipad/i.test(value)) return "iOS";
  return "Unknown OS";
}

export default async function LoginHistoryPage() {
  const headerStore = await headers();
  const userId = headerStore.get("x-rdleadify-user-id");
  const workspaceId = headerStore.get("x-rdleadify-workspace-id");
  const sessions = userId && workspaceId
    ? await prisma.authSession.findMany({
        where: { userId, workspaceId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          device: true,
          createdAt: true,
          updatedAt: true,
          lastSeenAt: true,
          revokedAt: true,
          expiresAt: true,
        },
      })
    : [];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Security" title="Login History" />
        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Session Activity</CardTitle>
                <CardDescription>IP, browser, OS, device, country placeholder, login time, logout time, and status.</CardDescription>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3">Device</th>
                      <th className="pb-3">IP</th>
                      <th className="pb-3">Browser</th>
                      <th className="pb-3">OS</th>
                      <th className="pb-3">Country</th>
                      <th className="pb-3">Login Time</th>
                      <th className="pb-3">Logout Time</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sessions.map((session) => {
                      const active = !session.revokedAt && session.expiresAt > new Date();
                      return (
                        <tr key={session.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <MonitorSmartphone className="h-4 w-4 text-emerald-300" />
                              <span className="font-semibold text-white">{session.device || "Browser session"}</span>
                            </div>
                          </td>
                          <td className="py-4 text-slate-300">{session.ipAddress || "unknown"}</td>
                          <td className="py-4 text-slate-300">{parseBrowser(session.userAgent)}</td>
                          <td className="py-4 text-slate-300">{parseOs(session.userAgent)}</td>
                          <td className="py-4 text-slate-300">Country pending</td>
                          <td className="py-4 text-slate-300">{session.createdAt.toLocaleString()}</td>
                          <td className="py-4 text-slate-300">{session.revokedAt?.toLocaleString() || "Active"}</td>
                          <td className="py-4"><Badge variant={active ? "success" : "neutral"}>{active ? "Active" : "Ended"}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
