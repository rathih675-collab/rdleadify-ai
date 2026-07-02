import {
  Activity,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Crown,
  KeyRound,
  MoreHorizontal,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type MemberStatus = "Online" | "Offline" | "Busy" | "Invited";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type TeamMember = {
  name: string;
  email: string;
  role: string;
  department: string;
  status: MemberStatus;
  assignedLeads: number;
  callsToday: number;
  lastActive: string;
};

const kpis: Kpi[] = [
  { label: "Total Team Members", value: "84", trend: "+8", helper: "Across all departments", icon: Users, variant: "success" },
  { label: "Online Members", value: "42", trend: "Live now", helper: "Available for assignment", icon: UserCheck, variant: "info" },
  { label: "Active Agents", value: "36", trend: "+12.4%", helper: "Sales and support active today", icon: PhoneCall, variant: "success" },
  { label: "Pending Invites", value: "9", trend: "Needs follow-up", helper: "Invitations awaiting acceptance", icon: UserPlus, variant: "warning" },
];

const members: TeamMember[] = [
  { name: "Priya Nair", email: "priya@rdleadify.example", role: "Manager", department: "Sales", status: "Online", assignedLeads: 84, callsToday: 32, lastActive: "Now" },
  { name: "Rahul Mehta", email: "rahul@rdleadify.example", role: "Sales Agent", department: "Enterprise", status: "Busy", assignedLeads: 63, callsToday: 28, lastActive: "4 min ago" },
  { name: "Meera Jain", email: "meera@rdleadify.example", role: "Support Agent", department: "Support", status: "Online", assignedLeads: 42, callsToday: 18, lastActive: "7 min ago" },
  { name: "Dev Shah", email: "dev@rdleadify.example", role: "Admin", department: "Partnerships", status: "Offline", assignedLeads: 31, callsToday: 12, lastActive: "1 hr ago" },
  { name: "Anika Rao", email: "anika@rdleadify.example", role: "Sales Agent", department: "Inbound", status: "Invited", assignedLeads: 0, callsToday: 0, lastActive: "Invite sent" },
];

const roles = ["Super Admin", "Admin", "Manager", "Sales Agent", "Support Agent", "Viewer"];
const departments = ["Sales", "Enterprise", "Inbound", "Support", "Partnerships", "Revenue Ops"];
const permissions = [
  "Dashboard Access",
  "Leads Access",
  "Contacts Access",
  "Campaign Access",
  "WhatsApp Access",
  "AI Agent Access",
  "Automation Access",
  "Billing Access",
  "Settings Access",
];

const assignmentModes = [
  { title: "Round Robin", description: "Distribute leads evenly across active agents.", icon: Activity },
  { title: "Manual Assignment", description: "Managers assign records directly.", icon: UserCog },
  { title: "AI Assignment", description: "AI routes by workload, score, and conversion likelihood.", icon: Bot },
  { title: "Skill-Based Assignment", description: "Match leads to skills, language, region, and role.", icon: Sparkles },
];

const activityLogs = [
  { type: "Login", detail: "Priya Nair signed in from Mumbai office", time: "2 min ago" },
  { type: "Lead Updated", detail: "Rahul moved CloudNine Realty to Demo Booked", time: "8 min ago" },
  { type: "Call Completed", detail: "Meera completed support call with UrbanLotus", time: "16 min ago" },
  { type: "Campaign Created", detail: "Growth Team created Hot Lead WhatsApp campaign", time: "1 hr ago" },
  { type: "Automation Edited", detail: "Revenue Ops updated no-reply follow-up workflow", time: "2 hrs ago" },
];

const performance = [
  { label: "Calls Completed", value: "1,284", helper: "+18.6% this week" },
  { label: "Leads Converted", value: "342", helper: "28.4% close influence" },
  { label: "Response Time", value: "04m 12s", helper: "Median first response" },
  { label: "Revenue Contribution", value: "$1.82M", helper: "Attributed active pipeline" },
];

const suggestions = [
  { title: "Best performing agent", detail: "Priya Nair leads in conversions and response quality.", variant: "success" as const },
  { title: "Agents needing follow-up", detail: "Anika Rao has pending invite and onboarding incomplete.", variant: "warning" as const },
  { title: "Workload imbalance", detail: "Rahul has 63 assigned leads while Support has spare capacity.", variant: "info" as const },
  { title: "Recommended lead assignment", detail: "Route high-value WhatsApp leads to Priya and Rahul today.", variant: "success" as const },
];

const statusVariant: Record<MemberStatus, BadgeVariant> = {
  Online: "success",
  Offline: "neutral",
  Busy: "warning",
  Invited: "info",
};

function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.icon;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={item.variant}>
            <ArrowUpRight className="h-3 w-3" />
            {item.trend}
          </Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{item.label}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{item.value}</h2>
        <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
      </CardContent>
    </Card>
  );
}

export default function TeamBuilderModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Admin" title="Team Builder" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Team operations</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Team Builder
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage members, departments, roles, permissions, assignments, activity,
                and performance across the RDLeadify AI revenue organization.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button><UserPlus className="h-4 w-4" />Invite Member</Button>
              <Button variant="outline"><KeyRound className="h-4 w-4" />Create Role</Button>
              <Button variant="outline"><BriefcaseBusiness className="h-4 w-4" />Create Department</Button>
              <Button variant="outline"><ShieldCheck className="h-4 w-4" />Manage Permissions</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => <KpiCard key={item.label} item={item} />)}
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="space-y-6 2xl:col-span-8">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Members, roles, departments, workload, and live status.</CardDescription>
                  </div>
                  <Badge variant="neutral">{members.length} members</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Name</th>
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Role</th>
                          <th className="pb-3 font-semibold">Department</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Assigned Leads</th>
                          <th className="pb-3 font-semibold">Calls Today</th>
                          <th className="pb-3 font-semibold">Last Active</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {members.map((member) => (
                          <tr key={member.email} className="align-top">
                            <td className="py-4 font-semibold text-white">{member.name}</td>
                            <td className="py-4 text-slate-300">{member.email}</td>
                            <td className="py-4"><Badge variant="info">{member.role}</Badge></td>
                            <td className="py-4 text-slate-300">{member.department}</td>
                            <td className="py-4"><Badge variant={statusVariant[member.status]}>{member.status}</Badge></td>
                            <td className="py-4 text-slate-300">{member.assignedLeads}</td>
                            <td className="py-4 text-slate-300">{member.callsToday}</td>
                            <td className="py-4 text-slate-400">{member.lastActive}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${member.name} actions`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Operational teams for assignment and reporting.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {departments.map((department) => (
                      <div key={department} className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <BriefcaseBusiness className="h-5 w-5 text-emerald-300" />
                        <p className="mt-3 font-semibold text-white">{department}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>Role templates for enterprise access control.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {roles.map((role) => (
                      <div key={role} className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <Crown className="h-5 w-5 text-emerald-300" />
                        <p className="mt-3 font-semibold text-white">{role}</p>
                        <p className="mt-1 text-xs text-slate-500">Configurable permission set</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Permissions Matrix</CardTitle>
                  <CardDescription>Access controls across CRM and platform modules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                        <p className="text-sm font-semibold text-white">{permission}</p>
                        <Badge variant="success">Allowed</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Assignment</CardTitle>
                    <CardDescription>Routing strategies for leads and ownership.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assignmentModes.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <div key={mode.title} className="rounded-xl border border-white/10 bg-black/10 p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-emerald-300" />
                            <div>
                              <p className="font-semibold text-white">{mode.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-400">{mode.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Call Assignment</CardTitle>
                    <CardDescription>Assign calling queues by owner, skill, or AI routing.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Inbound call queue", "AI callback queue", "Missed call recovery", "Manager escalation"].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-3">
                          <PhoneCall className="h-4 w-4 text-emerald-300" />
                          <p className="text-sm font-semibold text-white">{item}</p>
                        </div>
                        <Badge variant="neutral">Ready</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Login, record, call, campaign, and automation events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={`${log.type}-${log.time}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{log.type}</p>
                        <Badge variant="neutral">{log.time}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{log.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Tracking</CardTitle>
                  <CardDescription>Team output and revenue contribution.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {performance.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Suggestions</CardTitle>
                      <CardDescription>Coaching, routing, and workload intelligence.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.map((item) => (
                    <div key={item.title} className="rounded-xl bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <Badge variant={item.variant}>AI</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
