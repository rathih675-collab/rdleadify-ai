import { headers } from "next/headers";
import { Activity, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/server/prisma";

type LogMetadata = {
  provider?: string;
  action?: string;
  status?: string;
  requestTime?: string;
  responseTime?: string;
  error?: string | null;
  workspaceId?: string;
};

function metadataOf(value: unknown): LogMetadata {
  if (!value || typeof value !== "object") return {};
  return value as LogMetadata;
}

export default async function IntegrationLogsPage() {
  const workspaceId = (await headers()).get("x-rdleadify-workspace-id");
  const logs = workspaceId
    ? await prisma.activityLog.findMany({
        where: {
          workspaceId,
          OR: [
            { entityType: "IntegrationLog" },
            { entityType: "GoogleSheetSyncLog" },
            { entityType: "CalendarBookingLog" },
            { action: { contains: "INTEGRATION" } },
            { action: { contains: "GOOGLE" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 80,
        select: {
          id: true,
          action: true,
          entityType: true,
          metadata: true,
          createdAt: true,
          workspace: { select: { name: true } },
        },
      })
    : [];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Platform" title="Integration Logs" />
        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric icon={Activity} label="Total Logs" value={logs.length} />
            <Metric icon={CheckCircle2} label="Success" value={logs.filter((log) => String(metadataOf(log.metadata).status ?? log.action).includes("SUCCESS")).length} />
            <Metric icon={AlertTriangle} label="Errors" value={logs.filter((log) => Boolean(metadataOf(log.metadata).error)).length} />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Provider Event Log</CardTitle>
                <CardDescription>Provider, action, status, request time, response time, error, and workspace scope.</CardDescription>
              </div>
              <Clock3 className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Request Time</th>
                      <th className="pb-3">Response Time</th>
                      <th className="pb-3">Error</th>
                      <th className="pb-3">Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {logs.map((log) => {
                      const metadata = metadataOf(log.metadata);
                      const status = metadata.status ?? (log.action.includes("SUCCESS") ? "SUCCESS" : "INFO");
                      return (
                        <tr key={log.id}>
                          <td className="py-4 font-semibold text-white">{metadata.provider ?? providerFromEntity(log.entityType)}</td>
                          <td className="py-4 text-slate-300">{metadata.action ?? log.action}</td>
                          <td className="py-4">
                            <Badge variant={status === "FAILED" ? "danger" : status === "SUCCESS" ? "success" : "info"}>{status}</Badge>
                          </td>
                          <td className="py-4 text-slate-300">{formatTime(metadata.requestTime ?? log.createdAt.toISOString())}</td>
                          <td className="py-4 text-slate-300">{formatTime(metadata.responseTime ?? log.createdAt.toISOString())}</td>
                          <td className="max-w-72 py-4 text-slate-400">{metadata.error || "None"}</td>
                          <td className="py-4 text-slate-300">{log.workspace.name}</td>
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

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-emerald-300" />
        <p className="mt-4 text-sm text-slate-400">{label}</p>
        <h2 className="mt-1 text-3xl font-bold text-white">{value}</h2>
      </CardContent>
    </Card>
  );
}

function providerFromEntity(entityType: string) {
  if (entityType === "GoogleSheetSyncLog") return "Google Sheets";
  if (entityType === "CalendarBookingLog") return "Google Calendar";
  return "Integration";
}

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}
