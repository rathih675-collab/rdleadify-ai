import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  Timer,
  Zap,
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
type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue";
type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

type Task = {
  id: string;
  title: string;
  relatedRecord: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
  source: "Manual" | "AI Suggestion" | "WhatsApp" | "Calendar" | "Automation" | "Call";
};

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type SuggestionGroup = {
  title: string;
  icon: LucideIcon;
  variant: BadgeVariant;
  items: string[];
};

const tasks: Task[] = [
  {
    id: "task-7001",
    title: "Call Aarav before demo confirmation",
    relatedRecord: "Aarav Sharma - Nova Estates",
    priority: "Urgent",
    status: "Pending",
    dueDate: "Today, 3:00 PM",
    assignedTo: "Priya Nair",
    source: "AI Suggestion",
  },
  {
    id: "task-7002",
    title: "Send pricing summary to CloudNine",
    relatedRecord: "Maya Iyer - CloudNine Realty",
    priority: "High",
    status: "In Progress",
    dueDate: "Today, 5:00 PM",
    assignedTo: "Rahul Mehta",
    source: "WhatsApp",
  },
  {
    id: "task-7003",
    title: "Review renewal risk for UrbanLotus",
    relatedRecord: "Rohan Das - UrbanLotus",
    priority: "Urgent",
    status: "Overdue",
    dueDate: "Yesterday, 6:00 PM",
    assignedTo: "Meera Jain",
    source: "Automation",
  },
  {
    id: "task-7004",
    title: "Prepare negotiation notes for MetroBuild",
    relatedRecord: "Sofia Khan - MetroBuild",
    priority: "Medium",
    status: "Pending",
    dueDate: "Tomorrow, 11:00 AM",
    assignedTo: "Dev Shah",
    source: "Calendar",
  },
  {
    id: "task-7005",
    title: "Log competitor objection details",
    relatedRecord: "Kabir Kapoor - Vertex Homes",
    priority: "Low",
    status: "Completed",
    dueDate: "Today, 10:30 AM",
    assignedTo: "Anika Rao",
    source: "Call",
  },
  {
    id: "task-7006",
    title: "Create follow-up sequence for no-reply leads",
    relatedRecord: "No Reply Segment",
    priority: "High",
    status: "In Progress",
    dueDate: "Friday, 2:00 PM",
    assignedTo: "Revenue Ops",
    source: "Manual",
  },
];

const kpis: Kpi[] = [
  {
    label: "Total Tasks",
    value: "1,248",
    trend: "+16.8%",
    helper: "Open and completed work items",
    icon: ListChecks,
    variant: "success",
  },
  {
    label: "Due Today",
    value: "127",
    trend: "42 urgent",
    helper: "Tasks due before end of day",
    icon: CalendarClock,
    variant: "info",
  },
  {
    label: "Overdue",
    value: "28",
    trend: "-9.4%",
    helper: "Past due tasks requiring action",
    icon: AlertTriangle,
    variant: "warning",
  },
  {
    label: "Completed",
    value: "846",
    trend: "+22.1%",
    helper: "Completed this month",
    icon: CheckCircle2,
    variant: "success",
  },
];

const statusVariant: Record<TaskStatus, BadgeVariant> = {
  Pending: "neutral",
  "In Progress": "info",
  Completed: "success",
  Overdue: "danger",
};

const priorityVariant: Record<TaskPriority, BadgeVariant> = {
  Low: "neutral",
  Medium: "info",
  High: "warning",
  Urgent: "danger",
};

const followUps = [
  { time: "3:00 PM", task: "Call Aarav before demo confirmation", owner: "Priya Nair" },
  { time: "5:00 PM", task: "Send pricing summary to CloudNine", owner: "Rahul Mehta" },
  { time: "6:30 PM", task: "Recover no-reply WhatsApp leads", owner: "AI Agent" },
];

const suggestions: SuggestionGroup[] = [
  {
    title: "Tasks to complete first",
    icon: Target,
    variant: "success",
    items: ["Call Aarav", "Review UrbanLotus risk", "Send CloudNine pricing"],
  },
  {
    title: "Overdue risk",
    icon: AlertTriangle,
    variant: "warning",
    items: ["UrbanLotus renewal", "No-reply lead segment"],
  },
  {
    title: "Follow-up recommendations",
    icon: Bot,
    variant: "info",
    items: ["WhatsApp hot leads", "Demo booked contacts", "Pricing page visitors"],
  },
];

const dueTimeline = [
  { label: "Morning", count: 18, completion: 82 },
  { label: "Afternoon", count: 64, completion: 48 },
  { label: "Evening", count: 45, completion: 27 },
  { label: "Overdue", count: 28, completion: 12 },
];

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

function FilterControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TasksTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Task Queue</CardTitle>
          <CardDescription>
            Prioritized work items across leads, contacts, deals, calls, and automations.
          </CardDescription>
        </div>
        <Badge variant="neutral">{tasks.length} tasks</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-3 font-semibold">Task</th>
                <th className="pb-3 font-semibold">Related Lead/Contact</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Assigned To</th>
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tasks.map((task) => (
                <tr key={task.id} className="align-top">
                  <td className="py-4">
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.id}</p>
                  </td>
                  <td className="py-4 text-slate-300">{task.relatedRecord}</td>
                  <td className="py-4">
                    <Badge variant={priorityVariant[task.priority]}>
                      <Flag className="h-3 w-3" />
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                  </td>
                  <td className="py-4 text-slate-300">{task.dueDate}</td>
                  <td className="py-4 text-slate-300">{task.assignedTo}</td>
                  <td className="py-4">
                    <Badge variant="neutral">{task.source}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="icon" aria-label={`Open ${task.title} actions`}>
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
  );
}

export default function TasksModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Tasks" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Revenue task command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Tasks
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Coordinate follow-ups, SLA queues, assignments, overdue recovery, and
                AI-prioritized sales execution across your CRM workspace.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>Task Filters</CardTitle>
                  <CardDescription>
                    Search and prioritize tasks by status, urgency, and assignee.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search task">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Task, lead, contact..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Overdue</option>
                  </select>
                </FilterControl>

                <FilterControl label="Priority filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All priorities</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </FilterControl>

                <FilterControl label="Assignee filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All assignees</option>
                    <option>Priya Nair</option>
                    <option>Rahul Mehta</option>
                    <option>Dev Shah</option>
                    <option>Meera Jain</option>
                    <option>AI Agent</option>
                  </select>
                </FilterControl>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-9">
              <TasksTable />
            </div>

            <div className="space-y-6 2xl:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Timer className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Today&apos;s Follow-ups</CardTitle>
                      <CardDescription>Critical follow-ups due today.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {followUps.map((item) => (
                    <div key={`${item.time}-${item.task}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.task}</p>
                        <Badge variant="info">{item.time}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">Owner: {item.owner}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Task Suggestions</CardTitle>
                      <CardDescription>Execution guidance based on urgency and revenue impact.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.map((group) => {
                    const Icon = group.icon;

                    return (
                      <div key={group.title} className="rounded-xl bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">{group.title}</p>
                          </div>
                          <Badge variant={group.variant}>{group.items.length}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <Badge key={`${group.title}-${item}`} variant="neutral">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Clock3 className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>Mini Calendar / Due Timeline</CardTitle>
                  <CardDescription>
                    Distribution of due tasks by daypart and completion progress.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {dueTimeline.map((slot) => (
                  <div key={slot.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{slot.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{slot.count} tasks due</p>
                      </div>
                      <Badge variant={slot.label === "Overdue" ? "warning" : "neutral"}>
                        {slot.completion}%
                      </Badge>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={slot.label === "Overdue" ? "h-full rounded-full bg-amber-400" : "h-full rounded-full bg-emerald-400"}
                        style={{ width: `${slot.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Automation-ready task model</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Tasks include status, priority, source, ownership, and related record fields
                    so backend APIs and automation triggers can connect without UI rewrites.
                  </p>
                </div>
              </div>
              <Badge variant="success">Ready for workflow APIs</Badge>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
