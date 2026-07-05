import { Clock3, KeyRound, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NORMAL_SESSION_SECONDS, REMEMBER_ME_SESSION_SECONDS } from "@/lib/server/auth-constants";

const settings = [
  { label: "Session Timeout", value: `${NORMAL_SESSION_SECONDS / 60 / 60} hours`, icon: Clock3 },
  { label: "Remember Me Duration", value: `${REMEMBER_ME_SESSION_SECONDS / 60 / 60 / 24} days`, icon: ShieldCheck },
  { label: "Password Policy", value: "8+ chars, uppercase, lowercase, number, special character", icon: KeyRound },
  { label: "OTP Expiry", value: "10 minutes", icon: LockKeyhole },
  { label: "Email Verification Required", value: "Enabled", icon: MailCheck },
  { label: "Login Notifications", value: "Architecture ready", icon: ShieldCheck },
];

export default function AuthSettingsPage() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Security" title="Authentication Settings" />
        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Workspace Authentication Policy</CardTitle>
                <CardDescription>Enterprise security defaults ready for future white-label and master-admin control.</CardDescription>
              </div>
              <Badge variant="success">Production defaults</Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {settings.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-5">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <p className="mt-4 font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.value}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
