"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MeResponse = {
  user?: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleLabel: string;
    workspace: { name: string; slug: string; timezone: string };
    timezone: string;
    language: string;
    status: string;
    emailVerified: boolean;
    lastLoginAt: string | null;
    lastLoginIp: string | null;
  };
  session?: {
    device: string | null;
    ipAddress: string | null;
    lastSeenAt: string | null;
    expiresAt: string;
  } | null;
};

export default function ProfileModule() {
  const [data, setData] = useState<MeResponse>({});
  const [notice, setNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const user = data.user;

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    const response = await fetch("/api/auth/me");
    const next = await response.json();
    setData(next);
  }

  async function saveProfile(formData: FormData) {
    setNotice("Saving profile...");
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        avatarUrl: formData.get("avatarUrl"),
        timezone: formData.get("timezone"),
        language: formData.get("language"),
      }),
    });
    const result = await response.json();
    setNotice(response.ok ? "Profile updated." : result.error || "Profile update failed.");
    await loadProfile();
  }

  async function changePassword(formData: FormData) {
    setPasswordNotice("Changing password...");
    const response = await fetch("/api/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
      }),
    });
    const result = await response.json();
    setPasswordNotice(response.ok ? result.message : result.error || "Password change failed.");
  }

  async function logoutAll() {
    await fetch("/api/auth/logout-all", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Security" title="User Profile" />
        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400 text-slate-950">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
                </span>
                <div>
                  <CardTitle>{user?.name || "Loading profile..."}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="success">{user?.roleLabel || "Role"}</Badge>
                    <Badge variant={user?.emailVerified ? "success" : "warning"}>{user?.emailVerified ? "Email verified" : "Email pending"}</Badge>
                    <Badge variant={user?.status === "Active" ? "success" : "danger"}>{user?.status || "Status"}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Info label="Workspace" value={user?.workspace.name} />
              <Info label="Timezone" value={user?.timezone} />
              <Info label="Language" value={user?.language} />
              <Info label="Last Login" value={formatDate(user?.lastLoginAt)} />
              <Info label="Last IP" value={user?.lastLoginIp} />
              <Info label="Last Device" value={data.session?.device} />
              <Info label="Session Seen" value={formatDate(data.session?.lastSeenAt)} />
              <Info label="Session Expires" value={formatDate(data.session?.expiresAt)} />
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update identity fields used across the CRM workspace.</CardDescription>
                </div>
                <Save className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent>
                <form action={saveProfile} className="grid gap-4">
                  <Field label="Full Name" name="name" defaultValue={user?.name || ""} />
                  <Field label="Phone" name="phone" defaultValue={user?.phone || ""} />
                  <Field label="Avatar URL" name="avatarUrl" defaultValue={user?.avatarUrl || ""} />
                  <Field label="Timezone" name="timezone" defaultValue={user?.timezone || "UTC"} />
                  <Field label="Language" name="language" defaultValue={user?.language || "English"} />
                  {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
                  <Button type="submit"><CheckCircle2 className="h-4 w-4" />Save Profile</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Change password or terminate every active device session.</CardDescription>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="space-y-5">
                <form action={changePassword} className="grid gap-4">
                  <Field label="Current Password" name="currentPassword" type="password" />
                  <Field label="New Password" name="newPassword" type="password" />
                  {passwordNotice ? <p className="text-sm text-amber-300">{passwordNotice}</p> : null}
                  <Button type="submit" variant="outline"><KeyRound className="h-4 w-4" />Change Password</Button>
                </form>
                <Button onClick={logoutAll} variant="outline" className="w-full">
                  <LogOut className="h-4 w-4" />
                  Logout From All Devices
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value || "Not captured"}</p>
    </div>
  );
}

function Field({ label, name, defaultValue = "", type = "text" }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-emerald-400/50" />
    </label>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not captured";
  return new Date(value).toLocaleString();
}
