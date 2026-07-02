import {
  ArrowUpRight,
  Bot,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  Download,
  Mail,
  MessageCircle,
  Move,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Timer,
  UserCheck,
  Users,
  Video,
  XCircle,
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
type MeetingStatus =
  | "Scheduled"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Rescheduled"
  | "No Show";
type MeetingType =
  | "Sales Call"
  | "Demo"
  | "Follow-up"
  | "Support Meeting"
  | "AI Voice Call"
  | "Video Meeting"
  | "Internal Meeting";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type Appointment = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  meetingType: MeetingType;
  date: string;
  time: string;
  assignedTo: string;
  status: MeetingStatus;
  source: string;
};

type ScheduleItem = {
  time: string;
  customer: string;
  meetingType: MeetingType;
  agent: string;
  status: MeetingStatus;
};

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const kpis: Kpi[] = [
  {
    label: "Total Appointments",
    value: "3,842",
    trend: "+18.6%",
    helper: "Scheduled across teams",
    icon: CalendarDays,
    variant: "success",
  },
  {
    label: "Today's Meetings",
    value: "42",
    trend: "12 priority",
    helper: "Meetings on today’s calendar",
    icon: CalendarClock,
    variant: "info",
  },
  {
    label: "Upcoming Meetings",
    value: "318",
    trend: "Next 14 days",
    helper: "Confirmed future appointments",
    icon: Clock3,
    variant: "warning",
  },
  {
    label: "Missed Appointments",
    value: "18",
    trend: "-7.2%",
    helper: "No-shows and missed calls",
    icon: XCircle,
    variant: "danger",
  },
];

const todaySchedule: ScheduleItem[] = [
  { time: "10:30 AM", customer: "Aarav Sharma", meetingType: "Demo", agent: "Priya Nair", status: "Confirmed" },
  { time: "12:00 PM", customer: "Maya Iyer", meetingType: "Sales Call", agent: "Rahul Mehta", status: "Scheduled" },
  { time: "02:15 PM", customer: "Neha Bansal", meetingType: "Support Meeting", agent: "Support Queue", status: "Rescheduled" },
  { time: "04:30 PM", customer: "Sofia Khan", meetingType: "Video Meeting", agent: "Dev Shah", status: "Confirmed" },
];

const appointments: Appointment[] = [
  {
    id: "appt-101",
    customer: "Aarav Sharma",
    phone: "+91 98765 42110",
    email: "aarav@novaestates.example",
    meetingType: "Demo",
    date: "Jul 2, 2026",
    time: "10:30 AM",
    assignedTo: "Priya Nair",
    status: "Confirmed",
    source: "WhatsApp",
  },
  {
    id: "appt-102",
    customer: "Maya Iyer",
    phone: "+91 99887 65432",
    email: "maya.iyer@cloudnine.example",
    meetingType: "Sales Call",
    date: "Jul 2, 2026",
    time: "12:00 PM",
    assignedTo: "Rahul Mehta",
    status: "Scheduled",
    source: "Website",
  },
  {
    id: "appt-103",
    customer: "Neha Bansal",
    phone: "+91 98112 45009",
    email: "neha@urbancove.example",
    meetingType: "Support Meeting",
    date: "Jul 2, 2026",
    time: "02:15 PM",
    assignedTo: "Support Queue",
    status: "Rescheduled",
    source: "Email",
  },
  {
    id: "appt-104",
    customer: "Sofia Khan",
    phone: "+91 90045 23188",
    email: "sofia@metrobuild.example",
    meetingType: "Video Meeting",
    date: "Jul 3, 2026",
    time: "04:30 PM",
    assignedTo: "Dev Shah",
    status: "Confirmed",
    source: "Referral",
  },
  {
    id: "appt-105",
    customer: "Rohan Das",
    phone: "+91 97001 12245",
    email: "rohan.das@urbanlotus.example",
    meetingType: "AI Voice Call",
    date: "Jul 4, 2026",
    time: "11:45 AM",
    assignedTo: "AI Voice Agent",
    status: "No Show",
    source: "AI Scheduler",
  },
];

const views = ["Day View", "Week View", "Month View", "Agenda View"];

const appointmentTypes: Array<{ label: MeetingType; icon: LucideIcon }> = [
  { label: "Sales Call", icon: Phone },
  { label: "Demo", icon: CalendarCheck },
  { label: "Follow-up", icon: RefreshCw },
  { label: "Support Meeting", icon: Users },
  { label: "AI Voice Call", icon: Bot },
  { label: "Video Meeting", icon: Video },
  { label: "Internal Meeting", icon: UserCheck },
];

const smartScheduler: Feature[] = [
  { title: "Auto Find Free Slot", description: "Scan availability across owners and teams.", icon: CalendarClock, variant: "success" },
  { title: "Suggest Best Time", description: "Use reply history and conversion patterns.", icon: Sparkles, variant: "info" },
  { title: "Auto Assign Team Member", description: "Route by owner, capacity, region, and role.", icon: UserCheck, variant: "success" },
  { title: "Auto Detect Time Zone", description: "Normalize invite times for customer location.", icon: Clock3, variant: "warning" },
  { title: "Conflict Detection", description: "Prevent double-booking and SLA collisions.", icon: XCircle, variant: "danger" },
  { title: "Working Hours Settings", description: "Control team availability and holiday rules.", icon: Settings, variant: "neutral" },
];

const whatsappActions: Feature[] = [
  { title: "Send Appointment Confirmation", description: "Confirm booking with approved template.", icon: MessageCircle, variant: "success" },
  { title: "Send Reminder", description: "Send timed reminders before meetings.", icon: Send, variant: "info" },
  { title: "Send Reschedule Link", description: "Offer self-serve rescheduling slots.", icon: RefreshCw, variant: "warning" },
  { title: "Send Cancellation Message", description: "Notify customer and update CRM status.", icon: XCircle, variant: "danger" },
];

const emailReminders = [
  { title: "24 Hours Before", description: "Email agenda, owner details, and join link.", icon: Mail, variant: "info" as const },
  { title: "1 Hour Before", description: "Send final reminder and preparation notes.", icon: Timer, variant: "warning" as const },
  { title: "Custom Reminder", description: "Configure custom timing per appointment type.", icon: Settings, variant: "neutral" as const },
];

const aiAutomation: Feature[] = [
  { title: "Auto Reminder", description: "AI selects channel and reminder timing.", icon: Bot, variant: "success" },
  { title: "Auto Follow-up", description: "Create tasks after completed or missed meetings.", icon: RefreshCw, variant: "info" },
  { title: "AI Reschedule Suggestion", description: "Suggest best alternate slot after conflict.", icon: Sparkles, variant: "warning" },
  { title: "No Show Detection", description: "Detect and trigger recovery sequence.", icon: XCircle, variant: "danger" },
];

const analytics = [
  { label: "Meetings Completed", value: "824", helper: "+16.2% this month" },
  { label: "Conversion Rate", value: "28.4%", helper: "Demo-to-opportunity" },
  { label: "No Show Rate", value: "6.8%", helper: "-2.4% improvement" },
  { label: "Average Meeting Duration", value: "32m", helper: "Across all types" },
];

const aiInsights = [
  { title: "Best Meeting Time", detail: "4:00 PM to 6:00 PM converts 18% better for demos." },
  { title: "Best Performing Agent", detail: "Priya Nair has the highest demo-to-deal conversion this week." },
  { title: "Peak Booking Hours", detail: "Most appointments are booked between 11 AM and 1 PM." },
  { title: "Missed Appointment Reasons", detail: "Top causes: reminder not read, wrong time zone, no join link." },
];

const miniCalendarDays = [
  { day: "Mon", date: "29", count: 8 },
  { day: "Tue", date: "30", count: 12 },
  { day: "Wed", date: "1", count: 9 },
  { day: "Thu", date: "2", count: 42, active: true },
  { day: "Fri", date: "3", count: 18 },
  { day: "Sat", date: "4", count: 6 },
  { day: "Sun", date: "5", count: 4 },
];

const statusVariant: Record<MeetingStatus, BadgeVariant> = {
  Scheduled: "info",
  Confirmed: "success",
  Completed: "success",
  Cancelled: "danger",
  Rescheduled: "warning",
  "No Show": "danger",
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

function FeatureCard({ item }: { item: Feature }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{item.title}</p>
            <Badge variant={item.variant}>Ready</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function CalendarModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Scheduling" title="Calendar & Appointments" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Scheduling command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Calendar & Appointments
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage bookings, calendar sync, reminders, no-shows, AI scheduling, and
                appointment analytics from one enterprise CRM workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>
                <Plus className="h-4 w-4" />
                Book Appointment
              </Button>
              <Button variant="outline">
                <Bot className="h-4 w-4" />
                AI Schedule Meeting
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Sync Google Calendar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Calendar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="space-y-6 2xl:col-span-8">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Calendar Views</CardTitle>
                    <CardDescription>Switch between operational scheduling views.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {views.map((view, index) => (
                      <Button key={view} variant={index === 1 ? "default" : "outline"}>
                        {view}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Today&apos;s Schedule</CardTitle>
                    <CardDescription>Meeting queue with owner and appointment status.</CardDescription>
                  </div>
                  <Badge variant="neutral">{todaySchedule.length} meetings</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {todaySchedule.map((item) => (
                      <div key={`${item.time}-${item.customer}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/10 p-4 md:grid-cols-[90px_1fr_160px_160px_120px] md:items-center">
                        <p className="text-sm font-semibold text-emerald-300">{item.time}</p>
                        <p className="font-semibold text-white">{item.customer}</p>
                        <Badge variant="neutral">{item.meetingType}</Badge>
                        <p className="text-sm text-slate-300">{item.agent}</p>
                        <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>CRM-linked appointments with source and ownership.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1020px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Phone</th>
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Meeting Type</th>
                          <th className="pb-3 font-semibold">Date</th>
                          <th className="pb-3 font-semibold">Time</th>
                          <th className="pb-3 font-semibold">Assigned To</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Source</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="align-top">
                            <td className="py-4 font-semibold text-white">{appointment.customer}</td>
                            <td className="py-4 text-slate-300">{appointment.phone}</td>
                            <td className="py-4 text-slate-300">{appointment.email}</td>
                            <td className="py-4"><Badge variant="neutral">{appointment.meetingType}</Badge></td>
                            <td className="py-4 text-slate-300">{appointment.date}</td>
                            <td className="py-4 text-slate-300">{appointment.time}</td>
                            <td className="py-4 text-slate-300">{appointment.assignedTo}</td>
                            <td className="py-4"><Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge></td>
                            <td className="py-4 text-slate-300">{appointment.source}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${appointment.customer} appointment actions`}>
                                <Move className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Appointment Types</CardTitle>
                    <CardDescription>Meeting categories available to reps, automations, and booking links.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {appointmentTypes.map((type) => {
                      const Icon = type.icon;

                      return (
                        <div key={type.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                          <Icon className="h-5 w-5 text-emerald-300" />
                          <p className="mt-3 font-semibold text-white">{type.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Mini Calendar</CardTitle>
                    <CardDescription>Weekly booking density.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {miniCalendarDays.map((day) => (
                      <div
                        key={`${day.day}-${day.date}`}
                        className={`rounded-xl border p-3 text-center ${
                          day.active
                            ? "border-emerald-400/40 bg-emerald-400/10"
                            : "border-white/10 bg-black/10"
                        }`}
                      >
                        <p className="text-xs text-slate-500">{day.day}</p>
                        <p className="mt-2 text-lg font-bold text-white">{day.date}</p>
                        <p className="mt-1 text-xs text-emerald-300">{day.count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Drag & Drop Preview</CardTitle>
                    <CardDescription>UI-only appointment movement preview.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["09:00 AM", "11:30 AM", "03:00 PM"].map((slot, index) => (
                    <div key={slot} className="rounded-xl border border-dashed border-white/15 bg-black/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{slot}</p>
                      {index === 1 ? (
                        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3">
                          <div className="flex items-center gap-2">
                            <Move className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">Drag appointment here</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div>
                    <CardTitle>AI Insights</CardTitle>
                    <CardDescription>Scheduling and conversion intelligence.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.map((insight) => (
                    <div key={insight.title} className="rounded-xl bg-black/20 p-4">
                      <p className="text-sm font-semibold text-white">{insight.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{insight.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>AI Smart Scheduler</CardTitle>
                <CardDescription>Availability, assignment, timezone, and conflict automation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {smartScheduler.map((item) => <FeatureCard key={item.title} item={item} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Calendar Integration</CardTitle>
                <CardDescription>Connected status, sync controls, and automation settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Connected Status</p>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Last Sync: Today, 2:42 PM</p>
                </div>
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4" />
                  Sync Button
                </Button>
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Auto Sync Toggle</p>
                    <Badge variant="success">On</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Analytics</CardTitle>
                <CardDescription>Meeting quality and conversion metrics.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {analytics.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Integration</CardTitle>
                <CardDescription>Appointment communication through approved templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {whatsappActions.map((item) => <FeatureCard key={item.title} item={item} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Reminder</CardTitle>
                <CardDescription>Email reminders for appointment attendance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emailReminders.map((item) => <FeatureCard key={item.title} item={item} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Reminder Automation</CardTitle>
                <CardDescription>AI-managed reminders, follow-ups, reschedules, and no-show recovery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiAutomation.map((item) => <FeatureCard key={item.title} item={item} />)}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
